import { NextResponse } from "next/server";
// This returns dynamic logs from your system operations
export async function GET() {
  const auditLogs = [
    { user: "Admin_Root", action: "Silo_Created", time: "2m ago" },
    { user: "System", action: "MFA_Enforced", time: "14m ago" },
    { user: "Manager_02", action: "Directives_Updated", time: "1h ago" }
  ];
  return NextResponse.json({ audit: auditLogs });
}