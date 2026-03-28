"use client";
import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Clock, CheckCircle2, Zap, Layers } from "lucide-react";

export function TaskKanban({ tasks, onAddTask, jiraStyle = false }: any) {
  const columns = jiraStyle
    ? [
        { id: "TODO", label: "TO DO", color: "bg-slate-400" },
        { id: "IN_PROGRESS", label: "IN PROGRESS", color: "bg-yellow-400" },
        { id: "IN_REVIEW", label: "IN REVIEW", color: "bg-red-400" },
        { id: "DONE", label: "DONE", color: "bg-emerald-400" }
      ]
    : [
        { id: "TODO", label: "Backlog", color: "bg-slate-400", icon: <Layers size={14}/> },
        { id: "IN_PROGRESS", label: "In Orbit", color: "bg-[#FFD541]", icon: <Zap size={14}/> },
        { id: "DONE", label: "Synchronized", color: "bg-emerald-400", icon: <CheckCircle2 size={14}/> }
      ];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-${columns.length} gap-8 mt-4`}>
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col">
          <div className="flex justify-between items-center mb-6 px-3">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{col.label}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm text-gray-400">
              {tasks.filter((t: any) => t.status === col.id).length}
            </span>
          </div>

          <div className="space-y-4 bg-gray-100/30 p-5 rounded-[2.8rem] border border-gray-100/50 min-h-[600px] backdrop-blur-sm">
            {tasks.filter((t: any) => t.status === col.id).map((task: any, i: number) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 group hover:border-yellow-200 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 h-full w-1 ${col.color} opacity-20`} />
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-[13px] font-bold tracking-tight text-[#2D2D2D] leading-tight">{task.title}</h4>
                  <button className="text-gray-200 hover:text-black transition-colors"><MoreHorizontal size={14}/></button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due"}</span>
                  <span className="text-[10px] font-bold text-blue-400">{task.code || "SCRUM-XX"}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2">{task.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                    <div className="w-5 h-5 bg-[#2D2D2D] text-[#FFD541] rounded-full flex items-center justify-center text-[8px] font-black">{task.employee?.name?.charAt(0)}</div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{task.employee?.name?.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-200"><Clock size={10} /><span className="text-[9px] font-black">{task.estimate || "24H"}</span></div>
                </div>
              </motion.div>
            ))}

            {col.id === "TODO" && (
              <button onClick={onAddTask} className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-300 hover:text-black hover:border-gray-300 hover:bg-white transition-all flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]">
                <Plus size={14}/> Add Directive
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}