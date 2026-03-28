import { prisma } from "@/lib/prisma";
import ManagerFullDashboard from "./ManagerFullDashboard";

export default async function Page() {
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  return <ManagerFullDashboard allEmployees={allUsers} />;
}