import { NextResponse } from "next/server";

// Guest sign-in removed — Operator requires a real account.
// Redirect to login so any existing links don't 404.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}
