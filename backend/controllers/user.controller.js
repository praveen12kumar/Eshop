import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {sendEmail} from "../utils/sendEmail.js";
import crypto from "crypto";
import User from "../models/user.models.js";
import {v2 as cloudinary} from 'cloudinary';

const registerUser = asyncHandler(async(req, res)=>{
    //get user details from frontend
    // validations
    // check for existing user
    // check image for avatar
    // upload to cloudinary
    // create user
    // send response

    const {name, email, password} = req.body;

    if([name, email, password].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    if (!email || !email.includes('@')) {
        throw new ApiError(400,'Please include a valid email' );
    }
    if (!password || password.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters long' );
    }

    const existedUser = await User.findOne({email});

    if(existedUser){
        throw new ApiError(409, "Email alreay exists")
    }

    //console.log("req.file", req.file);    

    const avatarLocalPath = req.file?.path;
    
    //console.log("avatarLocalPath", avatarLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar  = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file not uploaded")
    }

    const user = await User.create({
        name, 
        email,
        password,
        avatar:{
            public_id: avatar.public_id,
            url: avatar.url
        }
    });

    const createdUser =  await User.findById(user._id);
    if(!createdUser){
        return ApiError(500, "Something went wrong while registering user")
    }

    // send verification email
    //await sendEmail({email, emailType:"VERIFY", userId:createdUser._id});
    
    const verifyToken = user.generateVerifyToken();
        await user.save({validateBeforeSave:false});

        const verifyTokenUrl= `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${verifyToken}`;

        const vMessage = `Your email verification token is:- \n\n${verifyTokenUrl} \n\n If you have not requested this email then, please ingore it.`;

        try {
            await sendEmail({
                email,
                vSubject: `Email Verification`,
                emailType: "VERIFY",
                vMessage
            })
            // res.status(200).json(
            //     new ApiResponse(200,user, `Email sent to ${user.email} successfully`)
            // )
        } catch (error) {
            user.verifyToken = undefined;
            user.verifyTokenExpiry = undefined;
            await user.save({validateBeforeSave:false});
        }
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
});


const loginUser = asyncHandler(async(req, res)=>{
    const {email, password} = req.body;

    if (!email || !email.includes('@')) {
        throw new ApiError(403,'Please include a valid email' );
    }
    if (!password || password.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters long' );
    }

    // check user 
    const user = await User.findOne({email}).select("+password");

    if(!user){
        throw new ApiError(404, "Invalid email or password");
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);
    
    if(isPasswordMatched === false){
        throw new ApiError(401, "Invalid email or password")
    }

    const token = user.generateAccessToken();

    const options = {
        httpOnly : true, // cookies can only be modified by  server
        secure:true 
     }
    return res.status(200).cookie("token", token, options).json({
        user,
        token,
        message:"User Logged in",
        success:true,
    })
        
})


const logout = asyncHandler(async(req, res, next) => {
        // Clear the "token" cookie
        res.clearCookie("token", {
            expires: new Date(Date.now()),
            httpOnly: true
        });
    
        res.status(200).json(
            new ApiResponse(200, "Logged Out")
    );
});
    


const changeUserPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body;

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "password does not match")
    };

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.isPasswordCorrect(oldPassword);

    if(!isMatch){
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, "Password updated successfully")
    )
})


const getCurrentUser = asyncHandler(async(req, res)=>{

    const user = await User.findById(req.user.id);
    if(!user){
        return res.status(404).json({
            success:false,
            message:"Login to access this resource"
        })
    }
    return res.status(200).json(
        new ApiResponse(200, user, "current user fetched successfully")
    )
});



const verifyEmail = asyncHandler(async(req, res)=>{
    const verifyToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user =  await User.findOne({verifyToken, verifyTokenExpiry:{$gt: Date.now()}});

    if(!user){
        throw new ApiError(400, "verify email token invalid or expired");
    }

    user.isverified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200,{}, "Email verified successfully")
    )
})


const forgotPassword = asyncHandler(async(req, res)=>{
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const forgotToken = user.generateForgotPasswordToken();

    await user.save({validateBeforeSave:false});

    const forgotPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${forgotToken}`;

    const fMessage = `Your password for forgot token is:- \n\n ${forgotPasswordUrl} \n\n If you have not requested this email then, Please ignore it.`;

    try {
        await sendEmail({
            email:user.email,
            fSubject: `Ecommerce Password Recovery`,
            emailType:"RESET",
            fMessage
        });
        res.status(200).json(
            new ApiResponse(200,user, `Email sent to ${user.email} successfully`)
        )
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save({validateBeforeSave:false});

        throw new ApiError(500, error.message)
    }

})


const resetPassword = asyncHandler(async(req, res)=>{
    const{password, confirmPassword} = req.body;
     
    if(password !== confirmPassword){
        throw new ApiError(400,"Password does not match");
    }

    const forgotPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({forgotPasswordToken, forgotPasswordTokenExpiry:{$gt:Date.now()}});

    if(!user){
        throw new ApiError(404,"Reset Password token invalid or expired")
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save();

    const token = user.generateAccessToken();

    const options = {
        httpOnly : true, // cookies can only be modified by  server
        secure:true 
     }
    return res.status(200).cookie("token", token, options).json(
        new ApiResponse(200, {token, user}, "Password changed successfully")
    );
});


const updateProfile = asyncHandler(async(req, res)=>{
    
    const {name, email, avatar} = req.body;
    let updatedAvatar = {};
    let updated = false;
    
    cloudinary.config({ 
        cloud_name: process.env.NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
      });  
    
    if(req.file?.path){
        updated = true;
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar file is required")
        }
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
        updatedAvatar  = await uploadOnCloudinary(avatarLocalPath);
        
        if(!updatedAvatar){
        throw new ApiError(400, "Avatar file not uploaded")
        }
        
    }

    const user = await User.findByIdAndUpdate(req.user._id,{
        name, 
        email,
        avatar:{
            public_id: updated ? updatedAvatar.public_id : req.user.avatar.public_id,
            url: updated ? updatedAvatar.url : req.user.avatar.url
        }
    }, {new:true} );

   
    res.status(200).json(
        new ApiResponse(200, user, "profile updated successfully")
    )
});


// Get all User(admin)

const getAllUser = asyncHandler(async(req, res)=>{
    const users = await User.find();

    res.status(200).json(
        new ApiResponse(200, users, "All users")
    )
})


// Get single user(admin)
const getSingleUser = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        throw new ApiError(404, `User does not exist with Id:${req.params.id}`);
    }
    res.status(200).json(
        new ApiResponse(200, user, "User details")
    );
})


// update user Role -- Admin
const updateUserRole = asyncHandler(async(req, res)=>{
    const newUserData  = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {new:true});
    
    if(!user){
        throw new ApiError(404, `User does not exist with Id:${req.params.id}`);
    }
   
    res.status(200).json(
        new ApiResponse(200, user, "Role updated successfully")
    )
});

// Delete user -- admin
const deleteUser = asyncHandler(async(req, res)=>{
   
    const user = await User.findById(req.params.id);
    if(!user){
        throw new ApiError(404, `User does not found`)
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    res.status(200).json(
        new ApiResponse(200, deletedUser, "User deleted successfully")
    )
});



export {
    registerUser,
    loginUser,
    logout,
    changeUserPassword,
    getCurrentUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser

};