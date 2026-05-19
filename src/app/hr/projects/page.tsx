"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, deptRes] = await Promise.all([
          fetch("/api/hr/projects", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/hr/departments", { credentials: "include" }).then((r) => r.json()),
        ]);
        if (projRes.projects) setProjects(projRes.projects);
        if (deptRes.departments) setDepartments(deptRes.departments);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = filterStatus === "all" ? projects : projects.filter((p) => p.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "IN_PROGRESS":
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Projects Management</h1>
          <p className="text-slate-500 mt-2">Manage projects and assignments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-black text-white hover:bg-slate-900">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All Projects" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "COMPLETED", label: "Completed" },
          { value: "PLANNING", label: "Planning" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterStatus(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === option.value
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Briefcase size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-black">No projects found</p>
          <p className="text-sm text-slate-500 mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                      <Briefcase size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                      {project.description && <p className="text-sm text-slate-600 mt-0.5">{project.description}</p>}
                    </div>
                  </div>
                  {project.departmentId && departments.find((d) => d.id === project.departmentId) && (
                    <p className="text-xs text-slate-500 mt-2">
                      Department: {departments.find((d) => d.id === project.departmentId)?.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.status)}
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status || "Planning"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
