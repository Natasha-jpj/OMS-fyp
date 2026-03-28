import EmployeeLayout from "../components/EmployeeLayout";
export default function EmployeeBroadcastsPage() {
  return (
    <EmployeeLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Broadcasts</h1>
        <p className="text-gray-500">View company-wide announcements and broadcasts here.</p>
        {/* Broadcasts list can be integrated here */}
      </div>
    </EmployeeLayout>
  );
}
