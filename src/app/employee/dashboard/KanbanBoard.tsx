/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const columns = [
  { id: "TODO", label: "TO DO" },
  { id: "IN_PROGRESS", label: "IN PROGRESS" },
  { id: "IN_REVIEW", label: "IN REVIEW" },
  { id: "DONE", label: "DONE" },
];

export default function KanbanBoard({ initialTasks, employees, isManagerView = false, onTaskStatusChange }: any) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<any>(null);

  // Update tasks when initialTasks changes
  useEffect(() => {
    console.log("KanbanBoard received initialTasks:", initialTasks);
    setTasks(initialTasks || []);
  }, [initialTasks]);

  function getTasksByStatus(status: string) {
    return tasks.filter((t: any) => t.status === status);
  }

  function handleDragStart(event: any) {
    const { active } = event;
    const task = tasks.find((t: any) => t.id === active.id);
    setActiveTask(task);
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    
    const overCol = columns.find((col) => col.id === over.id);
    if (overCol) {
      // Dropped on a column: change status
      const updatedTasks = tasks.map((t: any) =>
        t.id === active.id ? { ...t, status: over.id } : t
      );
      setTasks(updatedTasks);
      if (onTaskStatusChange) onTaskStatusChange(active.id, over.id);
      
      // Update via API
      const endpoint = isManagerView ? "/api/manager/tasks" : "/api/employee/tasks";
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, status: over.id }),
      }).catch(err => console.error("Failed to update task status:", err));
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`grid grid-cols-1 lg:grid-cols-${columns.length} gap-8 mt-4`}>
        {columns.map((col) => (
          <DroppableColumn key={col.id} id={col.id} label={col.label}>
            <SortableContext
              items={getTasksByStatus(col.id).map((t: any) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {getTasksByStatus(col.id).map((task: any) => (
                <DraggableTask key={task.id} task={task} employees={employees} />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-6 rounded-[2rem] border shadow-lg">
            <div className="font-bold">{activeTask.title}</div>
            <div className="text-xs text-gray-400">{activeTask.description}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableColumn({ id, label, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[600px] bg-gray-100/30 p-5 rounded-[2.8rem] border border-gray-100/50 backdrop-blur-sm transition-all ${
        isOver ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6 px-3">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{label}</h3>
      </div>
      {children}
    </div>
  );
}

function DraggableTask({ task, employees }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const statusColor = {
    TODO: "bg-slate-400",
    IN_PROGRESS: "bg-yellow-400",
    IN_REVIEW: "bg-red-400",
    DONE: "bg-emerald-400",
  }[task.status] || "bg-slate-400";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 group hover:border-yellow-200 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden mb-4"
    >
      <div className={`absolute top-0 left-0 h-full w-1 ${statusColor} opacity-20`} />
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[13px] font-bold tracking-tight text-[#2D2D2D] leading-tight flex-1">{task.title}</h4>
        <button className="text-gray-200 hover:text-black transition-colors ml-2"><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#eee" /></svg></button>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-gray-400 font-medium mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{task.status}</span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          <div className="w-5 h-5 bg-[#2D2D2D] text-[#FFD541] rounded-full flex items-center justify-center text-[8px] font-black">
            {task.employee?.name?.charAt(0) || "U"}
          </div>
          <span className="text-[9px] font-bold text-gray-500 uppercase">
            {task.employee?.name?.split(' ')[0] || "User"}
          </span>
        </div>
      </div>
    </div>
  );
}
