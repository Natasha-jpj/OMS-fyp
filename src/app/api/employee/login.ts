import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, identifier } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  try {
    // allow either `email` or `identifier` (email or id) to authenticate
    let emp = null;
    if (email) {
      emp = await prisma.employee.findUnique({ where: { email } });
    } else if (identifier) {
      // prefer email lookup when identifier looks like an email
      if (typeof identifier === 'string' && identifier.includes('@')) {
        emp = await prisma.employee.findUnique({ where: { email: identifier } });
      } else {
        emp = await prisma.employee.findUnique({ where: { id: identifier } });
      }
    }
    if (!emp) return res.status(400).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, emp.password);
    if (!isValid) return res.status(400).json({ error: "Invalid email or password" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: JWT secret missing." });
    }

    const token = jwt.sign({ employeeId: emp.id, role: "EMPLOYEE" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, employee: { id: emp.id, name: emp.name, email: emp.email } });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error("Login error:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: "Internal server error", message: err.message, stack: err.stack });
    } else {
      res.status(500).json({ error: "Internal server error", detail: err });
    }
  }
}
