const User = require("../model/user");
const Post = require("../model/post");
const bcrypt = require("bcrypt");

exports.register = async (req,res)=>{
    try{
const { name,email,password } = req.body

let user = await User.findOne({ email: email})
if(user) return res.status(400).json({success:false, message:"User already Exists"})

user = await User.create({name,email,password,avatar:{public_id:"sample id",url:"sample_url"}})

// if user regsiter successfully then it will automatically logged in
const token = await user.generateToken()
const options = {
    expires : new Date(Date.now()+ 90*24*60*60*1000),
    httpOnly:true
}

res.status(201)
.cookie("token",token,options)
.json({success:true,user, token})



//res.status(201).json({success:true, user})

}catch(err){
        res.status(500).send({success :false,message:err.message});
    }
}



exports.login = async (req,res)=>{
    try{

        const { email, password} = req.body
        const user = await User.findOne({ email: email}).select("+password");

        if(!user) return res.status(400).json({success:false, message:"User does not Exists"})

        const isMatch = await user.matchPassword(password)

        if(!isMatch) return res.status(400).json({success:false, message:"Password is incorrect"})
         
        const token = await user.generateToken()

        const options = {
            expires : new Date(Date.now()+ 90*24*60*60*1000),
            httpOnly:true
        }

        res.status(200)
        .cookie("token",token,options)
        .json({success:true,user, token})


    }catch(err){
        res.status(500).send({success :false,message:err.message});
    }
}

//================================== User LogOut ==================================


exports.logout = async (req,res)=>{
    try{
         res.status(200)
         .cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
         .json({success:true,message:"Logged Out successfully"})

    }catch(err){
        res.status(500).send({success :false,message:err.message});
    }
}




//================================= Follow User =========================================

exports.followUser = async (req,res) => { 

try{

const userFollow =await User.findById(req.params.id);
const loggedInUser = await User.findById(req.user._id)
if(!userFollow){
    return res.status(404).json({success:false, message:"User does not Exists"})
}

if(loggedInUser.following.includes(userFollow._id)){

    const indexOfFollowing = loggedInUser.following.indexOf(userFollow._id)
    loggedInUser.following.splice(indexOfFollowing, 1)

    const indexOfFollower = userFollow.followers.indexOf(loggedInUser._id)
    userFollow.followers.splice(indexOfFollower, 1)

    await loggedInUser.save()
    await userFollow.save()

    res.status(200).json({success:true, message:"User UnFollowed"})

}else{

loggedInUser.following.push(userFollow._id)
userFollow.followers.push(loggedInUser._id)

await userFollow.save()
await loggedInUser.save()

 res.status(200).json({success:true, message:"User Followed"})

}

   } catch(err){
    res.status(500).send({success :false,message:err.message});
   }
          
}



//========================================= Update Passwords =================================

exports.updatePassword = async (req,res)=>{
try{
const user = await User.findById(req.user._id).select("+password")

const {oldPassword,newPassword} = req.body

if(!oldPassword || !newPassword){
    return res.status(400).json({success:false, message:"Old Password and New Password are required"})
}

const match = await user.matchPassword(oldPassword)

if(!match){
    return res.status(400).json({success:false, message:"Old Password is incorrect"})
}
user.password = newPassword
await user.save()

res.status(200).json({success:true, message:"Password Updated Successfully"})


}catch(err){
    res.status(500).send({success :false,message:err.message});
}

}



//========================================= Update Profile =================================


exports.updateProfile = async (req,res)=>{
try{

    const user = await User.findById(req.user._id)

    const {name,email} = req.body

    if(name){
    user.name = name
   }

   if(email){
    user.email = email
   }

   if(!name || !email){
    return res.status(400).json({success:false, message:"please enter details for updation"})
   }

   //avatar todo

   await user.save()
   res.status(200).json({success:true, message:"profile updated successfully"})


}catch(err){
    res.status(500).send({success :false,message:err.message});
}


}



//========================== Delete Profile =========================

exports.deleteProfile = async (req,res)=>{
try{

    const user = await User.findById(req.user._id)
    const posts = user.posts
    const followers = user.followers
    const userId = user._id
    const following = user.following
    await user.deleteOne()

    //logout when user is deleted
    res.status(200)
         .cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
          
// for deleteing every post of user
    for(let i=0;i<posts.length;i++){
      const post = await Post.findById(posts[i])
       await post.deleteOne()
    }

    // removing user from all followers following

    for(let i =0;i<followers.length;i++){
        const follower = await User.findById(followers[i])
        const index = follower.following.indexOf(userId)
        follower.following.splice(index, 1)
        await follower.save()
         
    }

    // removing usering from all following followers

    for(let i =0;i<following.length;i++){
        const follows = await User.findById(following[i])
        const index = follows.followers.indexOf(userId)
        follows.followers.splice(index, 1)
        await follows.save()
         
    }


    res.status(200).json({success:true, message:"profile deleted successfully"})

}catch(err){
    res.status(500).send({success :false,message:err.message});
}

}



//================= My  Profile Details ==========================

exports.myProfile = async (req,res)=>{
try{

    const user = await User.findById(req.user._id).populate("posts")

    res.status(200).json({success:true, user})

}catch(err){
    res.status(500).send({success :false,message:err.message});
}

}


//============================== get Users Profile =============================

exports.getUserProfile = async (req,res)=>{
try{
    const user = await User.findById(req.params.id).populate("posts")
    if(!user){
        return res.status(404).json({success:false, message:"User does not Exists"})
    }

    res.status(200).json({success:true, user})

}catch(err){
    res.status(500).send({success :false,message:err.message});
}

}

//============================== get All Users =================================

exports.getAllUsers = async (req,res)=>{
try{
    const users = await User.find().populate("posts")
    res.status(200).json({success:true, users})

}catch(err){
    res.status(500).send({success :false,message:err.message});
}

}