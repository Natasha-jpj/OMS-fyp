import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prismaClient";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

	const { name, email, password, departmentId } = req.body;

	if (!name || !email || !password || !departmentId) return res.status(400).json({ error: "Missing required fields" });

	try {
		const existing = await prisma.employee.findUnique({ where: { email } });
		if (existing) return res.status(400).json({ error: "Employee with this email already exists" });

		const hashed = await bcrypt.hash(password, 10);

		const employee = await prisma.employee.create({
			data: {
				name,
				email,
				password: hashed,
				department: { connect: { id: departmentId } },
			},
		});

		res.status(201).json({ message: "Employee created", employee: { id: employee.id, name: employee.name, email: employee.email } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
}

