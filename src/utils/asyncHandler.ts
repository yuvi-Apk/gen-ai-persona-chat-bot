// src/utils/asyncHandler.ts
import { NextRequest } from "next/server";
import { errorHandler } from "./errorHandler";

type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type RouteHandler = (
  req: NextRequest,
  context: RouteContext
) => Promise<Response>;

export const asyncHandler =
  (handler: RouteHandler) =>
    async (req: NextRequest, context: RouteContext) => {
      try {
        return await handler(req, context);
      } catch (err) {
        return errorHandler(err);
      }
    };