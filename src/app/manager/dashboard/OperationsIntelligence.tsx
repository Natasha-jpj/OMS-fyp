"use client";
import React from "react";
import { TrendingUp, Clock, AlertCircle, CheckCircle2, MoreVertical, Plus } from "lucide-react";

export function OperationsIntelligence({ tasks, employees, onAddTask }: any) {
  const doneCount = tasks.filter((t: any) => t.status === "DONE").length;
  const progressPercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="grid grid-cols-12 gap-8 text-left mt-4">
      {/* LEFT: METRICS & CHART */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Priority Tasks" value={`${doneCount}/${tasks.length}`} sub={`${progressPercent}% Done`} icon={<TrendingUp size={14}/>} color="text-emerald-500 bg-emerald-50" />
          <StatBox label="Upcoming" value="12/20" sub="50% Ready" icon={<Clock size={14}/>} color="text-blue-500 bg-blue-50" />
          <StatBox label="Overdue" value="02/30" sub="90% Overdue" icon={<AlertCircle size={14}/>} color="text-rose-500 bg-rose-50" />
          <StatBox label="Pending" value="26/30" sub="60% Progress" icon={<CheckCircle2 size={14}/>} color="text-yellow-600 bg-yellow-50" />
        </div>
        <div className="bg-white p-8 rounded-[2.8rem] border border-gray-50 shadow-sm">
          <h3 className="text-sm font-bold mb-8">Performance Output</h3>
          <div className="h-32 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-yellow-400 rounded-t-lg transition-all hover:bg-black" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: TASK TABLE & LEADERBOARD */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <div className="bg-white rounded-[2.8rem] border border-gray-50 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-gray-50">
            <h3 className="text-sm font-bold">Recommended Directives</h3>
            <button onClick={onAddTask} className="p-2.5 bg-yellow-400 rounded-full hover:bg-black hover:text-white transition-all"><Plus size={16}/></button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <tr><th className="px-8 py-4 text-left">Directive</th><th className="px-8 py-4 text-left">Assignee</th><th className="px-8 py-4 text-left">Status</th><th className="px-8 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5"><span className="text-[13px] font-bold text-slate-700">{task.title}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold uppercase">{task.employee?.name?.charAt(0)}</div>
                      <span className="text-[10px] font-bold text-slate-500">{task.employee?.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${task.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-gray-300"><MoreVertical size={14}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm space-y-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold tracking-tighter">{value}</p>
        <p className="text-[8px] font-black text-gray-300 uppercase">{sub}</p>
      </div>
    </div>
  );
}