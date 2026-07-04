import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const GET = asyncHandler(async (req, context) => {

    const { teacherId } = await context.params;



    return Response.json(new ApiResponse(200, { teacherId }, "Teacher info fetched successFully !"))
})