import asyncHandler from "express-async-handler";
import jwt  from "jsonwebtoken";

import { Retailer } from '../../models/retailerModel.js';
import { ApiError } from '../../utils/apiError.js'
import { ApiResponse } from '../../utils/apiResponse.js'

//generate access and refresh token
const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await Retailer.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.accessToken = accessToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating user and access token")
    }
}
//registeruser
const registerRetailer = asyncHandler(async (req, res) => {
    console.log("koko")
    const {name,email,pan,gstin,phoneNumber,role} = req.body
    if ([name,email,pan,gstin,phoneNumber,role].some((field) => {
        field?.trim() === ""
    })
    ) { throw new ApiError(400, "all fields are required") }

    const existedUser = await Retailer.findOne({
        $or: [{ phoneNumber }]
    })
    if (existedUser) { throw new ApiError(409, "User Already Exist") }

    const retailer = await Retailer.create({
        name,email,pan,gstin,phoneNumber,role
    })
    const  createdRetailer = await Retailer.findById(retailer._id).select("-password -refreshToken")
    if (! createdRetailer) throw new ApiError(500, "Something went wrong while registering the user")

    return res
        .status(201)
        .json(new ApiResponse(200,  createdRetailer, "Retailer registered Successfully"))
})
//login
const logInRetailer = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;console.log(req.body,phoneNumber)
    if (!phoneNumber) throw new ApiError(400, "Phone Number Required!");
console.log(phoneNumber)
    const retailer = await Retailer.findOne({ phoneNumber });
    if (!retailer) { throw new ApiError(409, "User does not exist"); }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(retailer._id);

    const loggedInRetailer = await Retailer.findById(retailer._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict', // You can adjust this based on your requirements
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    };

    const retailerCookieValue = JSON.stringify(loggedInRetailer);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .cookie('retailer', retailerCookieValue, options)
        .json(
            new ApiResponse(
                200,
                {
                    retailer: loggedInRetailer
                },
                "User logged In Successfully"
            )
        );
});
//logout
const logOutRetailer = asyncHandler(async (req, res) => {

    await Retailer.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true },

    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .clearCookie("retailer", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})
// Get retailer data
const getRetailerData = asyncHandler(async (req, res, next) => {
    console.log("hi")
    const retailer = await Retailer.findById(req.params.retailerid);
    if (!retailer) {
      return next(new ApiError("Shop not found", 404));
    }
    console.log("retailer")
    res.status(200).json({
      success: true,
      retailer,
    });
  });
//refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET_KEY
        )

        const user = await Retailer.findById(decodedToken?._id)
        if (!user) {throw new ApiError(401, "Invalid refresh token")}

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")}

        const options = {
            httpOnly: true,
            secure: true}

        const {accessToken, newRefreshToken} = await  generateAccessRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    }catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  
})
export {
    registerRetailer,
    logInRetailer,
    logOutRetailer,
    refreshAccessToken,
    getRetailerData
}