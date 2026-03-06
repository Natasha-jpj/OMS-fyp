"use client";
import React, { useState } from "react";
import EmployeeLayout from "../components/EmployeeLayout";

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState([
    { id: 1, title: "Annual Leave", status: "Approved", date: "2026-01-12", approver: "HR" },
    { id: 2, title: "Sick Leave", status: "Pending", date: "2026-01-15", approver: "Manager" },
    { id: 3, title: "Personal Leave", status: "Rejected", date: "2026-01-20", approver: "HR" },
  ]);
  const [form, setForm] = useState({ title: "", date: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setLeaves([
        ...leaves,
        {
          id: leaves.length + 1,
          title: form.title,
          status: "Pending",
          date: form.date,
          approver: "HR",
        },
      ]);
      setForm({ title: "", date: "", reason: "" });
      setSubmitting(false);
    }, 800);
  }

  return (
    <EmployeeLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <div className="flex gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Approved: {leaves.filter(l => l.status === "Approved").length}</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending: {leaves.filter(l => l.status === "Pending").length}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Rejected: {leaves.filter(l => l.status === "Rejected").length}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-xl p-6 shadow mb-8 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">Leave Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Sick Leave" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Describe your reason..." />
          </div>
          <button type="submit" disabled={submitting} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg mt-2 disabled:opacity-50 shadow-lg">
            {submitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
        <div className="space-y-4">
          {leaves.map(l => (
            <div key={l.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-md hover:shadow-xl transition flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${l.status === "Approved" ? "bg-emerald-400" : l.status === "Pending" ? "bg-yellow-400" : "bg-red-400"}`}>{l.title[0]}</span>
                <span className="font-bold text-gray-700 text-[15px]">{l.title}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${l.status === "Approved" ? "bg-emerald-100 text-emerald-700" : l.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{l.status}</span>
              </div>
              <span className="text-xs text-gray-400">{l.date} • {l.approver}</span>
              <span className="text-xs text-gray-500 italic">{l.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
}
