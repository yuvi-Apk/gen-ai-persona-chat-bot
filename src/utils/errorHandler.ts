// src/utils/errorHandler.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
// import { Prisma } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError";

export function errorHandler(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false, message: "Validation failed",
        errors: err.issues.map(i => ({ field: i.path.join("."), message: i.message })),
        data: null
      },
      { status: 400 }
    );
  }

  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors, data: null },
      { status: err.statusCode }
    );
  }

  //   if (err instanceof Prisma.PrismaClientKnownRequestError) {
  //     const messages: Record<string, string> = {
  //       P2002: `Duplicate value for: ${(err.meta?.target as string[])?.join(", ")}`,
  //       P2003: `Foreign key constraint: ${err.meta?.field_name}`,
  //       P2025: "Record not found",
  //     };
  //     return NextResponse.json(
  //       { success: false, message: messages[err.code] ?? "Database error", data: null },
  //       { status: 400 }
  //     );
  //   }

  if (err instanceof jwt.JsonWebTokenError) {
    return NextResponse.json(
      { success: false, message: "Invalid token", data: null },
      { status: 401 }
    );
  }

  if (err instanceof jwt.TokenExpiredError) {
    return NextResponse.json(
      { success: false, message: "Token expired", data: null },
      { status: 401 }
    );
  }

  if (err instanceof Error) {
    return NextResponse.json(
      { success: false, message: err.message, data: null },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: false, message: "Something went wrong", data: null },
    { status: 500 }
  );
}