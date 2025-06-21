import { type } from "@testing-library/user-event/dist/type";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            unique: true,
            required: [true, "password is required"]
        }
    }, {timestamps: true}
)

export const User = mongoose("User", userSchema)