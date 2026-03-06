import EmployeeLayout from "../components/EmployeeLayout";

const demoTasks = {
  new: [
    { id: 1, title: "J24 Changes", status: "New", user: "Daymin Martyn" },
    { id: 2, title: "K56 PBI updates", status: "New", user: "Jennefer D." },
    { id: 3, title: "L55 Task", status: "New", user: "Jennefer D." },
  ],
  approved: [
    { id: 4, title: "J24 Changes", status: "Approved", user: "Daymin Martyn" },
    { id: 5, title: "K88 PBI updates", status: "Pending", user: "Akash Sinha" },
  ],
  committed: [
    { id: 6, title: "J24 Issue", status: "Committed", user: "Daymin Martyn" },
    { id: 7, title: "K45 Issue", status: "Committed", user: "Jennefer D." },
    { id: 8, title: "I55 Issue", status: "Committed", user: "Jennefer D." },
  ],
  inprogress: [
    { id: 9, title: "K88 PBI updates", status: "Inprogress", user: "Akash Sinha" },
    { id: 10, title: "K45 Issue", status: "Inprogress", user: "Jennefer D." },
    { id: 11, title: "I55 Issue", status: "Inprogress", user: "Daymin Martyn" },
  ],
  completed: [
    { id: 12, title: "J24 Changes", status: "Completed", user: "Daymin Martyn" },
    { id: 13, title: "K45 Issue", status: "Completed", user: "Jennefer D." },
  ],
};


const columnMeta = {
  new: { label: "New Task", color: "bg-blue-50" },
  approved: { label: "Approved", color: "bg-green-50" },
  committed: { label: "Committed", color: "bg-orange-50" },
  inprogress: { label: "Inprogress", color: "bg-yellow-50" },
  completed: { label: "Completed", color: "bg-emerald-50" },
};
const columns = Object.keys(columnMeta);


function KanbanColumn({ colKey, tasks }: any) {
  const meta = columnMeta[colKey];
  return (
    <div className={`flex-1 rounded-2xl mx-2 min-w-[260px] shadow-lg border border-gray-100 bg-white flex flex-col`}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${meta.color} mb-2`}>
        <span className="font-bold text-gray-700 text-sm">{meta.label}</span>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-bold">{tasks.length}</span>
      </div>
      {colKey === "new" && (
        <button className="w-full mb-2 py-2 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs hover:bg-blue-200 transition">+ Add New Task</button>
      )}
      <div className="space-y-3 px-3 pb-3">
        {tasks.map((task: any) => (
          <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-md hover:shadow-xl transition flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[14px] text-gray-700">{task.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.status === "Completed" ? "bg-emerald-100 text-emerald-700" : task.status === "Approved" ? "bg-blue-100 text-blue-700" : task.status === "Committed" ? "bg-orange-100 text-orange-700" : task.status === "Inprogress" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"}`}>{task.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs border">{task.user.split(' ')[0][0]}{task.user.split(' ')[1] ? task.user.split(' ')[1][0] : ''}</div>
              <span className="text-[11px] text-gray-500 font-bold">{task.user}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmployeeTasksPage() {
  return (
    <EmployeeLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">My Tasks</h1>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map(colKey => (
            <KanbanColumn key={colKey} colKey={colKey} tasks={demoTasks[colKey]} />
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
}
