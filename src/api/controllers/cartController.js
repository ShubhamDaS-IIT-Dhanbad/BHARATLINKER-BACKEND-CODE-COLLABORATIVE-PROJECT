import asyncHandler from "express-async-handler";

import { Cart } from '../../models/cartModel.js';
import { ApiError } from '../../utils/apiError.js'
import { ApiResponse } from '../../utils/apiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
    const { mobileNumber, email, password, fullName, gender, pinCode } = req.body
    if ([mobileNumber, fullName, gender, pinCode].some((field) => {
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
        pinCode,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user")

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered Successfully"))
})
export{}