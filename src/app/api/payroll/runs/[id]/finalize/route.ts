// ============================================================
// FILE: src/app/api/payroll/runs/[runId]/finalize/route.ts
// ============================================================
//
// POST /api/payroll/runs/[runId]/finalize
//
// Locks the payroll run. Once finalized:
//   - Status changes to FINALIZED
//   - Run is locked (no further changes)
//   - All records are marked VERIFIED
//   - An audit log entry is created

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { runId } = params;
    const body = await request.json();
    const { approverNotes, finalizedBy } = body;

    if (!runId) {
      return NextResponse.json(
        { success: false, error: "runId is required" },
        { status: 400 }
      );
    }

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: runId },
      include: { records: true },
    });

    if (!payrollRun) {
      return NextResponse.json(
        { success: false, error: "Payroll run not found" },
        { status: 404 }
      );
    }

    if (payrollRun.status !== "CALCULATED") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot finalize payroll in ${payrollRun.status} status. Run must be CALCULATED first.`,
        },
        { status: 400 }
      );
    }

    if (payrollRun.records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No payroll records found. Process the payroll first." },
        { status: 400 }
      );
    }

    // Finalize in a transaction — all or nothing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and finalize the run
      const finalizedRun = await tx.payrollRun.update({
        where: { id: runId },
        data: {
          status: "FINALIZED",
          locked: true,
          finalizedAt: new Date(),
          finalizedBy: finalizedBy || "System",
          notes: approverNotes || payrollRun.notes,
        },
      });

      // 2. Mark all records as VERIFIED
      await tx.payrollRecord.updateMany({
        where: { payrollRunId: runId },
        data: { status: "VERIFIED" },
      });

      // 3. Create audit log entry
      await tx.payrollAuditLog.create({
        data: {
          organizationId: payrollRun.organizationId,
          entityType: "PayrollRun",
          entityId: runId,
          action: "FINALIZE",
          changes: {
            oldStatus: "CALCULATED",
            newStatus: "FINALIZED",
            recordCount: payrollRun.records.length,
            totalNetSalary: payrollRun.totalNetSalary.toString(),
          },
          reason: approverNotes || "Payroll finalized",
          createdBy: finalizedBy || "System",
        },
      });

      return finalizedRun;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Payroll finalized and locked successfully.",
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("POST /api/payroll/runs/[runId]/finalize error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to finalize payroll" },
      { status: 500 }
    );
  }
}


// ============================================================
// FILE: src/app/api/payroll/runs/[runId]/records/route.ts
// ============================================================
//
// GET /api/payroll/runs/[runId]/records
//
// Returns all PayrollRecords for a specific run.
// Used to show the detailed breakdown in the UI.