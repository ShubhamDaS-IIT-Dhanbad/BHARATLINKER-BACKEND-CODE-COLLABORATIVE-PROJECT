import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        firstName:{
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        middleName:{
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        lastName:{
            type: String,
            trim: true,
            index: true,
        },
        gender: {
            type: String,
            enum: ['M', 'F', 'other'],
        },
        watchList: [{ type: Schema.Types.ObjectId, ref: "Video" }],
        password: {
            type: String,
            required: true,
        },
        refreshToken: String,
        accessToken: String,
        address: { type: Schema.Types.ObjectId, ref: "Address" },
        pinCodes: {
            type:[String],
            default: [], 
            required: true,
        },
        pan: String,
        role: {
            type: String,
            enum: ['user', 'retailer', 'admin'],
        },
        cart:{
            type: Schema.Types.ObjectId, ref: "Product" 
        }
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET_key,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_kEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
