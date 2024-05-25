import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const retailerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    pan: {
        type: String,
    },
    gstin: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'retailer', 'admin'],
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    refreshToken: {
        type: String
    },
    accessToken: {
        type: String
    }
}, { timestamps: true });
retailerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

retailerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

retailerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET_key,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
retailerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET_kEY, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const Retailer = mongoose.model("Retailer", retailerSchema)