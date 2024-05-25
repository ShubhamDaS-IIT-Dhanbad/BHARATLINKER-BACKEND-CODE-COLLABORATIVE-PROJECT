import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {Retailer} from "../../models/retailerModel.js";
import jwt from "jsonwebtoken";
const retailerVerifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || (req.headers["authorization"] && req.headers["authorization"].replace("Bearer ", ""));
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedAccessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await Retailer.findById(decodedAccessToken?._id).select("-password -refreshToken");
        if (!user) {throw new ApiError(401, "Invalid Access Token");}
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export { retailerVerifyJwt };