import asyncHandler from "express-async-handler";
import jwt  from "jsonwebtoken";

import { User } from '../../models/userModel.js';
import { ApiError } from '../../utils/apiError.js'
import { ApiResponse } from '../../utils/apiResponse.js'

//generate access and refresh token
const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

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
const registerUser = asyncHandler(async (req, res) => {
    const { mobileNumber, email, password, fullName, gender, pinCodes } = req.body
    if ([mobileNumber, fullName, gender].some((field) => {
        field?.trim() === ""
    })
    ) { throw new ApiError(400, "all fields are required") }

    const existedUser = await User.findOne({
        $or: [{ mobileNumber }, { email }]
    })
    if (existedUser) { throw new ApiError(409, "User Already Exist") }

    const user = await User.create({
        mobileNumber,
        email,
        fullName,
        password,
        gender,
        pinCodes,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user")

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered Successfully"))
})
//login
const logIn = asyncHandler(async (req, res) => {
    const { mobileNumber } = req.body
    if (!mobileNumber) throw new ApiError(400, "Phone Number Required!")

    const user = await User.findOne({ mobileNumber })
    if (!user) { throw new ApiError(409, "user does not exist") }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .cookie('user',loggedInUser, { maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User logged In Successfully"
            )
        )

})
//logout
const logOut = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
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
        .clearCookie("user", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})
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

        const user = await User.findById(decodedToken?._id)
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
//get user detail

export {
    registerUser,
    logIn,
    logOut,
    refreshAccessToken
}