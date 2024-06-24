import { LikeRepository } from "./like.repository.js";


export class LikeController{

    constructor(){
        this.likeRepository = new LikeRepository();
    }

    async getLikes(req, res, next){
        try{
            const {id, type} = req.query;
            const likes = await this.likeRepository.getLikes(type, id);
            if(likes){
                console.log(likes)
                return res.status(200).send(likes);
            }
            else{
                return res.status(404).send("No likes found");
            }
            
        }catch(err){
            console.log(err);
            return res.status(500).send("Something went wrong");
          }
    }

    async likeItem(req, res){
        try{
            const id = req.query.id;
            const type=req.query.type;
            if(type!='Product' && type!='Category'){
                return res.status(400).send("Invalid");
            }
            if(type=='Product'){
                await this.likeRepository.likeProduct(req.userID, id);
            }else{
                await this.likeRepository.likeCategory(req.UserID, id);    
            }
        }catch(err){
            console.log(err);
            return res.status(500).send("Something went wrong");
          }
          res.status(201).send("liked successfully");
    }
}