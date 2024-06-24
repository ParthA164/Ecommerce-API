// import { ObjectId } from "mongodb";
// import { getClient, getDB } from "../../config/mongodb.js";
// import OrderModel from "./order.model.js";
// import { ApplicationError } from "../../error-handler/applicationError.js";

// export default class OrderRepository{
//     constructor(){
//         this.collection = "orders";
//     }

//     async placeOrder(userId){
//         const client = getClient();
//         const session = client.startSession();
//         try{
        
//         const db = getDB();
//         session.startTransaction();
//         // 1. Get cartitems and calculate total amount.
//         const items = await this.getTotalAmount(userId, session);
//         const finalTotalAmount = items.reduce((acc, item)=>acc+item.totalAmount, 0)
//         console.log(finalTotalAmount);
        
//         // 2. Create an order record.
//         const newOrder = new OrderModel(new ObjectId(userId), finalTotalAmount, new Date());
//         await db.collection(this.collection).insertOne(newOrder, {session});
        
//         // 3. Reduce the stock.
//         for(let item of items){
//             await db.collection("products").updateOne(
//                 {_id: item.productID},
//                 {$inc:{stock: -item.quantity}},{session}
//             )
//         }
//         // throw new Error("Something is wrong in placeOrder");
//         // 4. Clear the cart items.
//         await db.collection("cartItems").deleteMany({
//             userID: new ObjectId(userId)
//         },{session});
//         session.commitTransaction();
//         session.endSession();
//         return;
//         }catch(err){
//             await session.abortTransaction();
//             session.endSession();
//             console.log(err);
//             throw new ApplicationError("Something went wrong with database", 500);    
//         }
//     }

//     async getTotalAmount(userId, session){
//         const db = getDB();
//         const items = await db.collection("cartItems").aggregate([
//             // 1. Get cart items for the user
//             {
//                 $match:{userID: new ObjectId(userId)}
//             },
//             // 2. Get the products form products collection.
//             {
//                 $lookup:{
//                     from:"products",
//                     localField:"productID",
//                     foreignField:"_id",
//                     as:"productInfo"
//                 }
//             },
//             // 3. Unwind the productinfo.
//             {
//                 $unwind:"$productInfo"
//             },
//             // 4. Calculate totalAmount for each cartitems.
//             {
//                 $addFields:{
//                     "totalAmount":{
//                         $multiply:["$productInfo.price", "$quantity"]
//                     }
//                 }
//             }
//         ], {session}).toArray();
//         return items;
//     }
// }


import { ObjectId } from "mongodb";
import { getClient, getDB } from "../../config/mongodb.js";
import OrderModel from "./order.model.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class OrderRepository {
    constructor() {
        this.collection = "orders";
    }

    async placeOrder(userId) {
        const client = getClient();
        const session = client.startSession();
        try {
            const db = getDB();
            session.startTransaction();

            // 1. Get cartitems and calculate total amount.
            const items = await this.getTotalAmount(userId, session);
            const finalTotalAmount = items.reduce((acc, item) => acc + item.totalAmount, 0);
            console.log(`Final total amount: ${finalTotalAmount}`);

            // 2. Create an order record.
            const newOrder = new OrderModel(new ObjectId(userId), finalTotalAmount, new Date());
            await db.collection(this.collection).insertOne(newOrder, { session });

            // 3. Reduce the stock.
            for (let item of items) {
                await db.collection("products").updateOne(
                    { _id: item.productID },
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }

            // 4. Clear the cart items.
            await db.collection("cartItems").deleteMany({
                userID: new ObjectId(userId)
            }, { session });

            await session.commitTransaction();
        } catch (err) {
            console.log(err);
            await session.abortTransaction();
            throw new ApplicationError("Something went wrong with database", 500);
        } finally {
            session.endSession();
        }
    }

    async getTotalAmount(userId, session) {
        const db = getDB();
        const items = await db.collection("cartItems").aggregate([
            // 1. Get cart items for the user
            {
                $match: { userID: new ObjectId(userId) }
            },
            // 2. Get the products from products collection.
            {
                $lookup: {
                    from: "products",
                    localField: "productID",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            // 3. Unwind the productinfo.
            {
                $unwind: "$productInfo"
            },
            // 4. Calculate totalAmount for each cartitems.
            {
                $addFields: {
                    "totalAmount": {
                        $multiply: ["$productInfo.price", "$quantity"]
                    }
                }
            }
        ], { session }).toArray();
        console.log(`Aggregated items: ${JSON.stringify(items)}`);
        return items;
    }
}


// import mongoose from 'mongoose';
// import { ApplicationError } from '../../error-handler/applicationError.js';
// import { orderSchema } from './order.schema.js';
// import { productSchema } from '../product/product.schema.js';
// import { cartSchema } from '../cartItems/cartItems.schema.js';
// import { ObjectId } from 'mongodb';

// const Order = mongoose.model("Order", orderSchema);
// const Product = mongoose.model("Product", productSchema);
// const CartItem = mongoose.model("Cart", cartSchema);

// export default class OrderRepository {
//   async placeOrder(userId) {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       // 1. Get cart items and calculate total amount
//       const items = await this.getTotalAmount(userId, session);
//       console.log('Aggregated cart items:', items); // Log the aggregated cart items

//       const finalTotalAmount = items.reduce((acc, item) => acc + item.totalAmount, 0);
//       console.log('Final total amount:', finalTotalAmount); // Log the final total amount

//       // 2. Create order record
//       const newOrder = await Order.create([{ userId, totalAmount: finalTotalAmount }], { session });
//       console.log('New Order:', newOrder); // Log the new order for debugging

//       // 3. Reduce product stock
//       for (let item of items) {
//         await Product.updateOne(
//           { _id: item.productID },
//           { $inc: { inStock: -item.quantity } },
//           { session }
//         );
//       }

//       // 4. Clear cart items
//       await CartItem.deleteMany({ userId }, { session });

//       await session.commitTransaction();
//       session.endSession();

//       return newOrder;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(err);
//       throw new ApplicationError("Something went wrong with database", 500);
//     }
//   }

//   async getTotalAmount(userId, session) {
//     try {
//       const items = await CartItem.aggregate([
//         {
//           $match: { userId: new ObjectId(userId) }
//         },
//         {
//           $lookup: {
//             from: 'products',
//             localField: 'productID',
//             foreignField: '_id',
//             as: 'productInfo'
//           }
//         },
//         {
//           $unwind: '$productInfo'
//         },
//         {
//           $addFields: {
//             totalAmount: { $multiply: ['$productInfo.price', '$quantity'] }
//           }
//         }
//       ]).session(session).exec();

//       console.log('Aggregation result:', items); // Log the results of the aggregation
//       return items;
//     } catch (err) {
//       console.error('Error in getTotalAmount:', err);
//       throw new ApplicationError("Something went wrong with database", 500);
//     }
//   }
// }

// const Order = mongoose.model("Order", orderSchema);
// const Product = mongoose.model("Product", productSchema);
// const CartItem = mongoose.model("Cart", cartSchema);

// export default class OrderRepository {

//   async placeOrder(userId) {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       // 1. Get cart items and calculate total amount
//       const items = await this.getTotalAmount(userId, session);
//       const finalTotalAmount = items.reduce((acc, item) => acc + item.totalAmount, 0);
//       console.log(finalTotalAmount);

//       // 2. Create order record
//       const newOrder = await Order.create([{ userId, totalAmount: finalTotalAmount }], { session });
//       console.log(newOrder);

//       // 3. Reduce product stock
//       for (let item of items) {
//         await Product.updateOne(
//           { _id: item.productID },
//           { $inc: { inStock: -item.quantity } },
//           { session }
//         );
//       }

//       // 4. Clear cart items
//       await CartItem.deleteMany({ userId }, { session });

//       await session.commitTransaction();
//       session.endSession();

//       return newOrder;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(err);
//       throw new ApplicationError("Something went wrong with database", 500);
//     }
//   }

//   async getTotalAmount(userId, session) {
//     return CartItem.aggregate([
//       {
//         $match: { userId: new ObjectId(userId)  }
//       },
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productID',
//           foreignField: '_id',
//           as: 'productInfo'
//         }
//       },
//       {
//         $unwind: '$productInfo'
//       },
//       {
//         $addFields: {
//           totalAmount: { $multiply: ['$productInfo.price', '$quantity'] }
//         }
//       }
//     ]).session(session);
//   }
// }



// import mongoose from 'mongoose';
// import { ObjectId } from "mongodb";
// import { ApplicationError } from '../../error-handler/applicationError.js';
// import { orderSchema } from './order.schema.js';
// import { productSchema } from '../product/product.schema.js';
// import {cartSchema} from "../cartItems/cartItems.schema.js"


// const orderModel=new mongoose.model("orders",orderSchema);
// const productModel= new mongoose.model("Product",productSchema);
// const cartModel= new mongoose.model("Cart",cartSchema);


// export default class OrderRepository {


//   async placeOrder(userId) {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       // 1. Get cart items and calculate total amount
//       const items = await orderModel.getTotalAmount(userId, session);
//       const finalTotalAmount = items.reduce((acc, item) => acc + item.totalAmount, 0);

//       // 2. Create order record
//       const newOrder = await orderModel.create([{ userId, totalAmount: finalTotalAmount }], { session });

//       // 3. Reduce product stock
//       for (let item of items) {
//         await productModel.updateOne(
//           { _id: item.productID },
//           { $inc: { inStock: -item.quantity } },
//           { session }
//         );
//       }

//       // 4. Clear cart items
//       await cartModel.deleteMany({ userId }, { session });

//       await session.commitTransaction();
//       session.endSession();

//       return newOrder;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(err);
//       throw new ApplicationError("Something went wrong with database", 500);
//     }
//   }

//   async getTotalAmount(userId, session) {
//     return  await cartModel.aggregate([
//       {
//         $match: { userId: mongoose.Types.ObjectId(userId) }
//       },
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'productID',
//           foreignField: '_id',
//           as: 'productInfo'
//         }
//       },
//       {
//         $unwind: '$productInfo'
//       },
//       {
//         $addFields: {
//           totalAmount: { $multiply: ['$productInfo.price', '$quantity'] }
//         }
//       }
//     ]).session(session);
//   }
// }


 