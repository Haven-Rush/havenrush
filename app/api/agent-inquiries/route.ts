import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AgentInquiryBody = {
  name?: unknown;
  email?: unknown;
  brokerage?: unknown;
  packageInterest?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  let body: AgentInquiryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const brokerage =
    typeof body.brokerage === "string" && body.brokerage.trim() ? body.brokerage.trim() : undefined;
  const packageInterest = typeof body.packageInterest === "string" ? body.packageInterest.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !packageInterest || !message) {
    return NextResponse.json(
      { error: "name, email, packageInterest, and message are required" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const inquiry = await prisma.agentInquiry.create({
    data: { name, email, brokerage, packageInterest, message },
  });

  return NextResponse.json({ id: inquiry.id }, { status: 201 });
}
