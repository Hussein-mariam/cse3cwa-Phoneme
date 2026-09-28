import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkVisit } from "@/lib/validate";

// POST /api/visits - a page sends how long it was open, for the average time on page
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body was not valid JSON." }, { status: 400 });
  }

  const error = checkVisit(body);
  if (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  await prisma.pageVisit.create({
    data: { page: body.page, seconds: body.seconds },
  });
  return NextResponse.json({ saved: true }, { status: 201 });
}
