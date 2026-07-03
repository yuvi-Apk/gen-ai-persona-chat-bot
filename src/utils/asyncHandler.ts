// src/utils/asyncHandler.ts
import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "./errorHandler";

type RouteHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export const asyncHandler =
  (handler: RouteHandler) =>
    async (req: NextRequest, context?: { params: Record<string, string> }) => {
      try {
        return await handler(req, context);
      } catch (err) {
        return errorHandler(err); // ← your errorHandler, adapted below
      }
    };