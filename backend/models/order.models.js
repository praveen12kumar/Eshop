import mongoose,{Schema} from "mongoose";

const orderSchema = new Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
        },
        state:{
            type:String,
            required:true,
        },
        country:{
            type:String,
            required:true,
            default:"India",
        },
        pincode:{
            type:Number,
            required:true,
        },
        phoneNo:{
            type:Number,
            required:true,
        },
        
    },
    orderItems:[
        {
            name:{
                type:String,
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
            },
            price:{
                type:Number,
                required:true,
            },
            image:{
                type:String,
                required:true,
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'Product',
                required:true,
            },
        },
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },
    paymentInfo:{
        paymentId:{
            type:String,
           
        },
        status:{
            type:String,
          
        },
        orderId:{
            type:String
        }
    },
    paidAt:{
        type:String,
        required:true,
    },
    itemsPrice:{
        type:Number,
        default:0
    },
    shippingPrice:{
        type:Number,
        default:0
    },
    totalPrice:{
        type:Number,
        default:0
    },
    orderStatus:{
        type:String,
        required:true,
        default:"Processing"
    },
    deliveredAt:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
});


const Order = mongoose.model("Order", orderSchema)

export default Order;