import { type } from "@testing-library/user-event/dist/type";
import mongoose from "mongoose";


const useridschema = new mongoose.Schema({
     type: mongoose.Schema.Types.ObjectId,
     ref: "user"
})


const userSchema = new mongoose.Schema(
    {
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    postBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
    
    }, {timestamps: true}
)

export const Task = mongoose("Like", TaskSchema)