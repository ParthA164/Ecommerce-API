import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const orderSchema= new mongoose.Schema({

    totalAmount:Number,
    timestamp:{
        type:Date,
        default:Date.now

    }
});