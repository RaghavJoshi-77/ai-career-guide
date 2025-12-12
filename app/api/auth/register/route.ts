import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "email  and password are required" }, { status: 400 });
  }
  //valid email checking 
  let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }
  //valid password 
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
  }
  //eq for equality comparison
  const existUser = await db.select().from(userTable).where(eq(userTable.email, email)).execute();
  if (existUser.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
  const hashedpassword = await bcrypt.hash(password, 10);
  const user = await db.insert(userTable).values({
    email,
    password: hashedpassword
  });
  console.log(user);
  
  return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });

    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}