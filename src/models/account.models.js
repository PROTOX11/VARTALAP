import { type } from "@testing-library/user-event/dist/type";
import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
    {
        intro: {
            required: true,
            type: String
        },
        age: {
            required: true,
            type: Number
        },
        education: {
            required: true,
            type: String,
            default: none
        },
        lifeevent: {
            required: true,
            type: String
        },
        city: {
            required: true,
            type: String
        }
    }, {timestamps: true}
)

export const Account = mongoose("Account", AccountSchema)