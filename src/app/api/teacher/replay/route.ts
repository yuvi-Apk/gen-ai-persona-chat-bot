import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";

export const GET = asyncHandler(async (req, ) => {
    


    return Response.json(new ApiResponse(200, {  }, "Teacher replied successfully !"))
})