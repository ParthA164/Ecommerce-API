import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import mongoose from "mongoose";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const ProductModel = mongoose.model("Product", productSchema);
const ReviewModel = mongoose.model("Review", reviewSchema);
const CategoryModel = mongoose.model('Category', categorySchema)

class ProductRepository{

    constructor(){
        this.collection = "products";
    }

    async add(productData){
        try{
            // 1. Adding Product
            productData.categories = productData.category.split(',').map(id => id.trim());
            console.log(productData);
            const newProduct = new ProductModel(productData);
            const savedProduct = await newProduct.save();
            
            // 2. Update categories.
            await CategoryModel.updateMany(
                {_id: {$in: productData.categories}},
                {$push: {products: new ObjectId(savedProduct._id)}}
            )
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    } 
 
    async getAll(){
        try{
            const products= await ProductModel.find();
            console.log(products);
            return products;

        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);

        }
        // try{
        //     const db = getDB();
        //     const collection = db.collection(this.collection);
        //     const products = await collection.find().toArray();
        //     console.log(products);
        //     return products;
        // }catch(err){
        //     console.log(err);
        //     throw new ApplicationError("Something went wrong with database", 500);    
        // } 
    }

    async get(id){

        try{
            const product= await ProductModel.findById(id);
            console.log(product);
            return product;

        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
        }

        // try{
        //     const db = getDB();
        //     const collection = db.collection(this.collection);
        //     return await collection.findOne({_id: new ObjectId(id)});
        // }catch(err){
        //     console.log(err);
        //     throw new ApplicationError("Something went wrong with database", 500);    
        // }
    }

    // Product hosuld have min price specified and category
    async filter(minPrice, categories){
        try{ 
            let filterExpression = {};

        // Handle minPrice filter
        if (minPrice) {
            filterExpression.price = { $gte: parseFloat(minPrice) };
        }

        // Handle categories filter
        if (categories) {
            // Ensure categories is a string before calling replace
            if (typeof categories === 'string') {
                // Convert single quotes to double quotes for JSON parsing
                categories = categories.replace(/'/g, '"');
                categories = JSON.parse(categories); // Parse the string into an array
            } else {
                throw new Error('Categories must be a string');
            }

            console.log(categories);

            // Update filterExpression with categories filter
            if (Array.isArray(categories) && categories.length > 0) {
                filterExpression = {
                    $or: [
                        { category: { $in: categories } },
                        filterExpression
                    ]
                };
            }
        }

        // Execute the query with the filter expression
        return await ProductModel.find(filterExpression).select({
            name: 1,
            price: 1,
            _id: 1,
            ratings: { $slice: -1 }
        });
            // let filterExpression={};
            // if(minPrice){
            //     filterExpression.price = {$gte: parseFloat(minPrice)}
            // }
            // // ['Cat1', 'Cat2']
            // categories = JSON.parse(categories.replace(/'/g, '"'));
            // console.log(categories);
            // if(categories){
            //     filterExpression={$or :[{category:{$in:categories}} , filterExpression]}
            //     // filterExpression.category=category
            // }
            // return await ProductModel.find(filterExpression).select({name:1, price:1, _id:0, ratings:{$slice:-1}});  //instead of project in mongoDb , select is used in mongoose

        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);     
        }
    }

//     async rate(userID, productID, rating){
//         try{
//             const db = getDB();
//             const collection = db.collection(this.collection); 
//             //1. Find the product
//             const product = await collection.findOne({_id:new ObjectId(productID)});
//             // 2. Find the rating
//             const userRating = product?.ratings?.find(r=> r.userID==userID);
//            if(userRating){
//             // 3. Update the rating
//                 await collection.updateOne({
//                     _id:new ObjectId(productID), "ratings.userID": new ObjectId(userID)
//                 },{
//                     $set:{
//                         "ratings.$.rating":rating
//                     }
//                 })
//            }else{
//             await collection.updateOne({
//                 _id:new ObjectId(productID)
//             },{
//                 $push:{ratings:{userID:new ObjectId(userID), rating}}
//             })
//            }
//         }catch(err){
//             console.log(err);
//             throw new ApplicationError("Something went wrong with database", 500);    
//         }
//     }
// }

async rate(userID, productID, rating){
    try{
        // 1. Check if product exists
        const productToUpdate = await ProductModel.findById(productID);
        if(!productToUpdate){
            throw new Error("Product not found")
        }

        // Find the existing review
        const userReview = await ReviewModel.findOne({product: new ObjectId(productID), user: new ObjectId(userID)});
        if(userReview){
            userReview.rating = rating;
            await userReview.save();
        }else{
            const newReview = new ReviewModel({
                product: new ObjectId(productID),
                user: new ObjectId(userID),
                rating: rating
            });
            newReview.save();
        }

    }catch(err){
        console.log(err);
        throw new ApplicationError("Something went wrong with database", 500);    
    }
}

async averageProductPricePerCategory(){
    try{
        
        return await ProductModel
            .aggregate([
                {
                    // Stage 1: Get Average price per category
                    $group:{
                        _id:"$categories",
                        averagePrice:{$avg:"$price"}
                    }
                }
            ]);    //mongoose does the toArray() part by itself to convert to javascript array
    }catch(err){
        console.log(err);
        throw new ApplicationError("Something went wrong with database", 500);    
    } 
}
}

export default ProductRepository;