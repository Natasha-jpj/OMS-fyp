import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed multiple tasks for a specific employee
  const employeeId = 'cmk82f3rx0007f4txbgrz8xx8'; // Change as needed

  await prisma.task.createMany({
    data: [
      {
        title: 'Prepare Monthly Report',
        description: 'Compile and review the monthly financial report.',
        status: 'TODO',
        employeeId,
      },
      {
        title: 'Client Follow-up',
        description: 'Contact clients for feedback on recent projects.',
        status: 'IN_PROGRESS',
        employeeId,
      },
      {
        title: 'Update CRM',
        description: 'Ensure all client records are up to date in the CRM system.',
        status: 'TODO',
        employeeId,
      },
    ],
  });

  console.log('Seeded multiple tasks for employee', employeeId);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
