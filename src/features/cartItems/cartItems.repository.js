import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import mongoose from "mongoose";
import {cartSchema} from "./cartItems.schema.js"

const cartModel= new mongoose.model("Cart",cartSchema);

export default class CartItemsRepository{
 
    constructor(){
        this.collection = "cartItems";
    }
    async add(productID, userID, quantity) {
        try {
            // Update the document if it exists, otherwise insert a new document
            await cartModel.updateOne(
                { productID: new mongoose.Types.ObjectId(productID), userID: new mongoose.Types.ObjectId(userID) },
                {
                    $setOnInsert: {
                        productID: new mongoose.Types.ObjectId(productID),
                        userID: new mongoose.Types.ObjectId(userID)
                    },
                    $inc: {
                        quantity: quantity
                    }
                },
                { upsert: true }
            );
        } catch (err) {
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
        }
    }
    // async add(productID, userID, quantity){
    //     try{
    //         // const db = getDB();
    //         // const collection = db.collection(this.collection)
    //         // const id = await this.getNextCounter(db);
    //         // find the document
    //         // either insert or update
    //         // Insertion.
            
    //         await cartModel.updateOne(
    //             {productID:new ObjectId(productID), userID:new ObjectId(userID)},
    //             {
    //                 $setOnInsert: {_id:userID},
    //                 $inc:{
    //                 quantity: quantity
    //             }},
    //             {upsert: true})

    //     }catch(err){
    //         console.log(err);
    //         throw new ApplicationError("Something went wrong with database", 500);    
    //     }
    // }

    async get(userID){
        try{
            // const db = getDB();
            // const collection = db.collection(this.collection)
            
            // return await collection.find({userID:new ObjectId(userID)}).toArray();
            const cartItem= await cartModel.find({userID:userID});
            console.log(cartItem);
            return cartItem;
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

    async delete(userID, cartItemID){
        try{
            // const db = getDB();
            // const collection = db.collection(this.collection)  
            const result = await cartModel.deleteOne({_id: new ObjectId(cartItemID), userID: new ObjectId(userID)});
            return result.deletedCount>0;
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

    async getNextCounter(db){

        const resultDocument = await db.collection("counters").findOneAndUpdate(
            {_id:'cartItemId'},
            {$inc:{value: 1}},
            {returnDocument:'after'}
        )  
        console.log(resultDocument);
        return resultDocument.value.value;
    }
}