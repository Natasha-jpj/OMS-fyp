// import EmployeeLayout from "../components/EmployeeLayout";
// import React, { useEffect, useState } from "react";
// import OfficeMessenger from "../../components/OfficeMessenger";
// export default function EmployeeChatPage() {
//   const [employee, setEmployee] = useState<any>(null);
//   const [allEmployees, setAllEmployees] = useState<any[]>([]);
//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     if (savedUser) setEmployee(JSON.parse(savedUser));
//     fetch("/api/employee/list").then(res => res.json()).then(data => setAllEmployees(data.employees || []));
//   }, []);
//   return (
//     <EmployeeLayout>
//       <div className="p-8">
//         <h1 className="text-3xl font-bold mb-4">Chat</h1>
//         <p className="text-gray-500 mb-6">Connect with colleagues in real time.</p>
//         {employee && <OfficeMessenger currentUser={employee} allEmployees={allEmployees} />}
//       </div>
//     </EmployeeLayout>
//   );
// }
