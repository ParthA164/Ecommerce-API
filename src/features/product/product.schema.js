
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    inStock: Number,
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ],
    categories:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Category'
        }
    ]
});
