"use client";

import React from "react";
import { Download, Printer, Share2 } from "lucide-react";
import { formatCurrency } from "@/lib/payroll/helpers";
import { PayslipData } from "@/lib/payroll/types";

interface PayslipTemplateProps {
  data: PayslipData;
  showActions?: boolean;
}

export function PayslipTemplate({ data, showActions = true }: PayslipTemplateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Placeholder for PDF generation
    console.log("Downloading payslip as PDF...");
  };

  const handleShare = async () => {
    // Placeholder for sharing functionality
    console.log("Sharing payslip...");
  };

  const monthYear = `${new Date(2024, data.month - 1).toLocaleDateString("en-US", {
    month: "long",
  })} ${data.year}`;

  return (
    <div className="w-full">
      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3 mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer size={18} /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download size={18} /> PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 size={18} /> Share
          </button>
        </div>
      )}

      {/* Payslip Document */}
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto"
        style={{ minHeight: "1200px" }}
      >
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">{data.company.name}</h1>
              {data.company.address && (
                <p className="text-sm text-gray-600 mt-1">{data.company.address}</p>
              )}
              {data.company.phone && (
                <p className="text-sm text-gray-600">{data.company.phone}</p>
              )}
            </div>
            {data.company.logo && (
              <img
                src={data.company.logo}
                alt="Company Logo"
                className="h-16 w-16 object-contain"
              />
            )}
          </div>
        </div>

        {/* Payslip Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">SALARY STATEMENT</h2>
          <p className="text-gray-600 text-lg">{monthYear}</p>
        </div>

        {/* Employee Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-semibold">EMPLOYEE NAME</p>
              <p className="text-lg font-bold text-gray-900">{data.employee.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-semibold">EMPLOYEE ID</p>
              <p className="text-sm font-medium text-gray-900">{data.employee.employeeId}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-semibold">POSITION</p>
              <p className="text-sm font-medium text-gray-900">{data.employee.position}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-semibold">DEPARTMENT</p>
              <p className="text-sm font-medium text-gray-900">{data.employee.department}</p>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 font-semibold">EMAIL</p>
              <p className="text-sm font-medium text-gray-900">{data.employee.email}</p>
            </div>
            {data.employee.phone && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 font-semibold">PHONE</p>
                <p className="text-sm font-medium text-gray-900">{data.employee.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Earnings Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-white bg-blue-600 p-3 mb-0">EARNINGS</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3">Basic Salary</td>
                <td className="py-2 px-3 text-right font-medium">
                  {formatCurrency(data.earnings.basicSalary)}
                </td>
              </tr>
              {Object.entries(data.earnings.allowances).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-200">
                  <td className="py-2 px-3">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(value as number)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-b-2 border-blue-600 bg-blue-50 font-bold">
                <td className="py-2 px-3">GROSS SALARY</td>
                <td className="py-2 px-3 text-right">
                  {formatCurrency(data.earnings.grossSalary)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-white bg-red-600 p-3 mb-0">DEDUCTIONS</h3>
          <table className="w-full text-sm">
            <tbody>
              {data.deductions.ssfEmployee > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-3">SSF (Employee 11%)</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(data.deductions.ssfEmployee)}
                  </td>
                </tr>
              )}
              {data.deductions.incomeTax > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-3">Income Tax</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(data.deductions.incomeTax)}
                  </td>
                </tr>
              )}
              {data.deductions.leaveDeduction > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-3">Leave Deduction</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(data.deductions.leaveDeduction)}
                  </td>
                </tr>
              )}
              {data.deductions.manualDeduction > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-3">Other Deduction</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(data.deductions.manualDeduction)}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-b-2 border-red-600 bg-red-50 font-bold">
                <td className="py-2 px-3">TOTAL DEDUCTIONS</td>
                <td className="py-2 px-3 text-right">
                  {formatCurrency(data.deductions.totalDeductions)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Salary Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">NET SALARY (TAKE HOME)</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(data.summary.netSalary)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Employer Contribution (SSF 20%)</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(data.summary.employerSSF)}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details (if available) */}
        {data.bankDetails && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-bold text-gray-900 mb-3">BANK TRANSFER DETAILS</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Account Holder</p>
                <p className="font-medium text-gray-900">{data.bankDetails.accountHolder}</p>
              </div>
              <div>
                <p className="text-gray-600">Bank Name</p>
                <p className="font-medium text-gray-900">{data.bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Number</p>
                <p className="font-mono font-medium text-gray-900">
                  {"*".repeat(data.bankDetails.accountNumber.length - 4) +
                    data.bankDetails.accountNumber.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 text-center text-xs text-gray-600">
          <p className="mb-2">This is a system-generated payslip.</p>
          <p className="mb-4">
            Please verify all details and contact HR if you find any discrepancies.
          </p>
          <p className="text-gray-400">
            Generated on {new Date(data.generatedAt).toLocaleDateString()} at{" "}
            {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Salary Breakdown Card Component
interface SalaryBreakdownCardProps {
  basicSalary: number;
  allowances: Record<string, number>;
  grossSalary: number;
  ssfEmployee: number;
  incomeTax: number;
  leaveDeduction: number;
  manualDeduction: number;
  totalDeductions: number;
  netSalary: number;
  ssfEmployer?: number;
  month: number;
  year: number;
}

export function SalaryBreakdownCard({
  basicSalary,
  allowances,
  grossSalary,
  ssfEmployee,
  incomeTax,
  leaveDeduction,
  manualDeduction,
  totalDeductions,
  netSalary,
  ssfEmployer = 0,
  month,
  year,
}: SalaryBreakdownCardProps) {
  const [showEmployerContributions, setShowEmployerContributions] = React.useState(false);

  const monthYear = `${new Date(2024, month - 1).toLocaleDateString("en-US", {
    month: "long",
  })} ${year}`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h3 className="text-xl font-bold text-gray-900">Salary Breakdown</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">{monthYear}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(netSalary)}</p>
        </div>
      </div>

      {/* Earnings Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 bg-blue-50 p-3 rounded mb-2">
          EARNINGS
        </h4>
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Basic Salary</td>
              <td className="text-right font-medium">{formatCurrency(basicSalary)}</td>
            </tr>
            {Object.entries(allowances).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="py-2">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                <td className="text-right font-medium">{formatCurrency(value)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-b-2 border-blue-200 bg-blue-50 font-bold">
              <td className="py-2">Gross Salary</td>
              <td className="text-right">{formatCurrency(grossSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deductions Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 bg-red-50 p-3 rounded mb-2">
          DEDUCTIONS
        </h4>
        <table className="w-full text-sm mb-4">
          <tbody>
            {ssfEmployee > 0 && (
              <tr className="border-b">
                <td className="py-2">SSF (Employee 11%)</td>
                <td className="text-right font-medium">{formatCurrency(ssfEmployee)}</td>
              </tr>
            )}
            {incomeTax > 0 && (
              <tr className="border-b">
                <td className="py-2">Income Tax</td>
                <td className="text-right font-medium">{formatCurrency(incomeTax)}</td>
              </tr>
            )}
            {leaveDeduction > 0 && (
              <tr className="border-b">
                <td className="py-2">Leave Deduction</td>
                <td className="text-right font-medium">{formatCurrency(leaveDeduction)}</td>
              </tr>
            )}
            {manualDeduction > 0 && (
              <tr className="border-b">
                <td className="py-2">Other Deductions</td>
                <td className="text-right font-medium">{formatCurrency(manualDeduction)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-b-2 border-red-200 bg-red-50 font-bold">
              <td className="py-2">Total Deductions</td>
              <td className="text-right">{formatCurrency(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Salary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-6 border-2 border-green-200">
        <p className="text-sm text-gray-600 font-medium">NET SALARY (TAKE HOME)</p>
        <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(netSalary)}</p>
      </div>

      {/* Employer Contributions */}
      {ssfEmployer > 0 && (
        <div>
          <button
            onClick={() => setShowEmployerContributions(!showEmployerContributions)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-900 transition-colors"
          >
            {showEmployerContributions ? "▼" : "▶"} Employer Contributions (SSF 20%)
          </button>
          {showEmployerContributions && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <div className="flex justify-between mb-2">
                <span>SSF Employer (20%)</span>
                <span className="font-bold">{formatCurrency(ssfEmployer)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Total Employer Cost</span>
                <span>{formatCurrency(grossSalary + ssfEmployer)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
