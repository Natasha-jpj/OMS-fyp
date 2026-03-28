import { NextResponse } from 'next/server'
import prisma from '../../../../../prismaClient'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, departmentId } = body

    if (!name || !email || !password || !departmentId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const existing = await prisma.employee.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashed,
        department: { connect: { id: departmentId } },
      },
    })

    return NextResponse.json({ message: 'Employee created', employee: { id: employee.id, name: employee.name, email: employee.email } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
