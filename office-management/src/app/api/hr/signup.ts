import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prismaClient";
import bcrypt from "bcrypt";

// use shared Prisma client from repo root

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, password, phone, organization, organizationDomain } = req.body;

  try {
    const existingHR = await prisma.hR.findUnique({ where: { email } });
    if (existingHR) return res.status(400).json({ error: "HR with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const hr = await prisma.hR.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        organization,
        organizationDomain,
      },
    });

    res.status(201).json({ message: "HR created successfully", hr: { id: hr.id, name: hr.name, email: hr.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
