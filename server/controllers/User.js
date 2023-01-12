
const { sendEmail } = require("../middleware/sendEmail")
const Post = require("../models/Post")
const User = require("../models/User")
const crypto = require('crypto')
const cloudinary = require('cloudinary')


exports.register =async(req,res)=>{
    try {
        const {name,email,password,avatar} = req.body
        let isExist = await User.findOne({email})
        if(isExist){
            res.status(400).json({
                success:false,
                message:'user already exist'
            })
        }else{
            const myCloud = await cloudinary.v2.uploader.upload(avatar,{
                folder:'avatars'
            })
            
        const userData = {name,avatar:{public_id:myCloud.public_id,url:myCloud.secure_url},email,password}
        const user = await User.create(userData)
        const token = await user.generateToken()
        res.status(201).cookie('token',token,{expires:new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),httpOnly:true}).json({
            success:true,
            user,
            token
        })
        }
        


    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.login = async(req,res)=>{
    try {
        const {email,password} = req.body
        const user = await User.findOne({email}).select("+password")
        if(!user){
            res.status(404).json({
                success:false,
                message:"user not found"
            })
        } 
        const isMatch = await user.matchPassword(password)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect password"
            })
        } 
        const token = await user.generateToken()
        res.status(200).cookie('token',token,{expires:new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),httpOnly:true}).json({
            success:true,
            user,
            token
        })      
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.logout = async(req,res)=>{
    try {
        res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly:true}).json({
            success:true,
            message:'Logged Out'
        })      
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.followUser = async(req,res)=>{
    try {
        const userToFollow = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.user._id)
        if(!userToFollow){
        res.status(404).json({
            success:false,
            message:'following user not found'
        })
    }
    
    if(loggedInUser.following.includes(userToFollow._id)){
        const indexFollowing = loggedInUser.following.indexOf(userToFollow._id)
        loggedInUser.following.splice(indexFollowing,1)
        const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id)
        userToFollow.followers.splice(indexFollowers,1)
        await loggedInUser.save()
        await userToFollow.save()
        res.status(200).json({
            success:true,
            message:'User Unfollowed'
        })
    }else{
        loggedInUser.following.push(userToFollow._id)
        userToFollow.followers.push(loggedInUser._id)
        await loggedInUser.save()
        await userToFollow.save()
        res.status(200).json({
            success:true,
            message:'User followed'
        })
    }
    
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
    
}

exports.updatePassword = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("+password")
        const {oldPassword,newPassword} = req.body
        if(!oldPassword || !newPassword){
            res.status(400).json({
                success:false,
                message:"Please Provide old and new password"
            })
        }
        const isMatch = await user.matchPassword(oldPassword)
        if(!isMatch){
            res.status(400).json({
                success:false,
                message:"Incorrect Old password"
            })
        }
        user.password = newPassword
        await user.save()
        res.status(200).json({
            success:true,
            message:"password updated"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
}

exports.updateProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id)
    const {name,email,avatar} = req.body
    if(name){
        user.name = name
    }
    if(email){
        user.email = email
    }
    if(avatar){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
        const myCloud = await cloudinary.v2.uploader.upload(avatar,{
            folder:"avatars"
        })
        user.avatar.public_id = myCloud.public_id
        user.avatar.url = myCloud.secure_url
    }
    await user.save()
    res.status(200).json({
        success:true,
        message:'profile updated'
    })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
}

exports.deleteMyProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id)
        const posts = user.posts
        const followers = user.followers
        const following = user.following
        const userId = user._id
        await user.remove()
        res.cookie('token',null, {expires:new Date(Date.now()),httpOnly:true})
        for(let i=0; i<posts.length; i++){
            const post = await Post.findById(posts[i])
            await post.remove()
        }
        for(let i=0; i<followers.length; i++){
            const follower = await User.findById(followers[i])
            const index = follower.following.indexOf(userId)
            follower.following.splice(index,1)
            await follower.save()
        }
        for(let i=0; i<following.length; i++){
            const follows = await User.findById(following[i])
            const index = follows.followers.indexOf(userId)
            follows.followers.splice(index,1)
            await follows.save()
        }
        res.status(200).json({
            success:true,
            message:'Profile Deleted'
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }

   
    
}

exports.getMyProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).populate('posts')
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getUserProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllUsers = async(req,res)=>{
    try {
        const users = await User.find()
        if(users.length <= 0){
            res.status(404).json({
                message:'NO USER'
            })
        }
        res.status(200).json({
            success:true,
            users
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.forgotPassword = async(req,res)=>{
    
    try {
        const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({
            success:false,
            message:'User not found'
        })
    }
    const resetPasswordToken = user.getResetPasswordToken()
    await user.save()
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`
    const message = `Reset your password by clicking on the link: ${resetUrl}`
    try {
        await sendEmail({email:user.email,subject:"Reset Password",message})
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.resetPassword = async(req,res)=>{
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt:Date.now()}
        })
        if(!user){
            return res.status(401).json({
                success:false,
                message:'Token is invalid or has expired'
            })
        }
        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        res.status(200).json({
            success:true,
            message:'Password updated successfully'
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getMyPosts = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const posts = [];
        
      for (let i = 0; i < user.posts.length; i++) {
        const post = await Post.findById(user.posts[i]).populate(
          "likes comments.user owner"
        );
        posts.push(post);
      }
  
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.getUserPosts = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        const posts = []
        for(let i=0;i<user.posts.length;i++){
            const post = await Post.findById(user.posts[i]).populate("likes comments.user owner")
            posts.push(post)
        }
        res.status(200).json({
            success:true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}