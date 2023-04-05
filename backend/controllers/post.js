const Post =require("../model/post");
const User =require("../model/user");


exports.createPost = async (req,res)=>{
try{
const newPostData ={
    caption : req.body.caption,
    image:{
        public_id:"req.body.public_id",
        url:"req.body.url"
    },
    owner :req.user._id
}

const post = await Post.create(newPostData)
const user = await User.findById(req.user._id)
console.log([post._id])
user.posts.push(post._id)
await user.save()


res.status(200).json({success:true,post})


}catch(err){
    res.status(500).json({
    success:false,
    message :err.message    })

}

}


exports.deletePost = async (req,res) => {
try{
    const post = await Post.findById(req.params.id)
    if(!post) {
        return res.status(404).json({success:false, message:"Post Not Found"})
    }
    if(post.owner.toString() !== req.user.id.toString()){
        return res.status(401).json({success:false, message:"Unauthorized"})
    }


    //console.log([post])
   await post.deleteOne();

   const user = await User.findById(req.user._id)
    
   const index = user.posts.indexOf(req.params.id)
   user.posts.splice(index, 1)
   await user.save()
    res.status(200).json({success:true,message:"Post Deleted"})

}catch(err){
    res.status(500).json({
    success:false,
    message :err.message    })
}

}










exports.likesAndUnlikesPost = async (req,res) => {
try{
const post = await Post.findById(req.params.id)

if(post.likes.includes(req.user._id)){
const index = post.likes.indexOf(req.user._id)
post.likes.splice(index, 1)
await post.save()
return res.status(200).json({success:true , message:"Post Unlikes"})

}else{

    post.likes.push(req.user._id)
    await post.save()
    return res.status(200).json({success:true, message:"Post Likes"})

}


}catch(err){
    res.status(500).json({
    success:false,
    message :err.message    })
}


}





exports.getPostOfFollowing = async (req,res) =>{
try{
 
const user = await User.findById(req.user._id) 
 
const post = await Post.find({owner:{$in:user.following}})

res.status(200).json({success:true, post})


}catch(err){
    res.status(500).json({
    success:false,
    message :err.message  })
}

     
}


//======================================= Update Post ===========================

exports.updateCaption = async (req,res) => {
try{
const post = await Post.findById(req.params.id)

if(!post) {
    return res.status(404).json({success:false, message:"Post Not Found"})
}

if(post.owner.toString() !== req.user._id.toString()){
    return res.status(401).json({success:false, message:"Unauthorized"})
}

post.caption = req.body.caption

await post.save()

res.status(200).json({success:true,message:"Post Updated"})


}catch(err){
    res.status(500).json({
    success:false,
    message :err.message  })

}

}