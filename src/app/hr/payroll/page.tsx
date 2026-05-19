"use client";

import React from "react";
import PayrollDashboard from "../components/PayrollDashboard";

export default function PayrollPage() {
  // Get organization ID from user or default
  const organizationId = "default";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Payroll Management</h1>
        <p className="text-slate-500 mt-2">Manage salaries and payroll processing</p>
      </div>

      {/* Payroll Dashboard Component */}
      <PayrollDashboard organizationId={organizationId} />
    </div>
  );
}
