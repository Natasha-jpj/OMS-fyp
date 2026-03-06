import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// use shared Prisma client from repo root

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;

  try {
    const hr = await prisma.hR.findUnique({ where: { email } });
    if (!hr) return res.status(400).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, hr.password);
    if (!isValid) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ hrId: hr.id, role: "HR" }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, hr: { id: hr.id, name: hr.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
