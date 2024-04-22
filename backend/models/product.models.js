import mongoose,{Schema} from "mongoose";


const productSchema = new Schema({
    name:{
        type:String,
        required:[true, "Please Enter product Name"],
        trim:true,
    },
    description:{
        type:String,
        required:[true, "Please Enter product Description"]
    },
    originalPrice:{
        type:Number,
        required:[true, "Please Enter product Price"],
        maxLength:[8, "Price can not exceed 8 characters"]
    },
    price:{
        type:Number,
        required:[true, "Please Enter product Price"],
        maxLength:[8, "Price can not exceed 8 characters"]
    },
    discount:{
        type:Number,
        default:0,
        required:true,
    },
    ratings:{
        type:Number,
        default:0,
    },

    images:[
        {
            public_id:{
                type:String,
                
            },
            url:{
                type:String,
                
            }
        }
    ],
    category:{
        type:String,
        required:[true, "Please Enter product Category"],
        trim:true
    },
    color:{
        type:String,
        default:"white"
    },

    stock:{
        type:Number,
        default:1,
        required:[true, "Please Enter product Stock"],
        maxLength:[4, "Stock cannot exceed 4 digits "]
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {   
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Product = mongoose.model("Product", productSchema);

export default Product;