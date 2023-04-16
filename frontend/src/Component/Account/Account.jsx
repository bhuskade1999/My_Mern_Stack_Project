import React, { useEffect, useState } from "react"
import "./Account.css"
import {useDispatch, useSelector} from "react-redux"
import { deleteMyProfile, getMyPosts ,logoutUser }from "../../Actions/User"
import Loader from "../Loader/Loader"
import Post from "../Post/Post";
import { Avatar, Button,Dialog, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useAlert } from "react-alert";
import User from "../User/User"





const Account = ()=>{

    const dispatch = useDispatch()
    const alert = useAlert()

    const {user,loading:userLoading } = useSelector((state)=>state.user)

    const {loading,error,posts} = useSelector((state)=> state.myPosts)

    const { error: likeError, message,loading:deleteLoading } = useSelector((state) => state.likes);

      const [followersToggle ,setFollowersToggle] = useState(false)
      const [followingToggle ,setFollowingToggle] = useState(false)

  const logoutHandler = async ()=>{
   await  dispatch(logoutUser())
    alert.success("logged out Successfully")
  }


const deleteProfileHandler = async()=>{
   await dispatch(deleteMyProfile())
    dispatch(logoutUser())
}

    useEffect(()=>{
        dispatch(getMyPosts())
    },[dispatch])
   
    useEffect(()=>{
        if(error){
            alert.error(error)
            dispatch({type:"clearErrors"})
        }
        if(likeError){
            alert.error(likeError)
            dispatch({type:"clearErrors"})
        }
        if(message){
            alert.success(message)
            dispatch({type:"clearMessage"})
        }
    },[alert,error,message,likeError,dispatch]) 


    return  loading === true || userLoading === true ? <Loader/> :( <div className = "account">


    <div className ="accountleft"> 
    
    {
        posts && posts.length > 0 ? posts.map(post=>(
            <Post
                 key ={post._id} 
                 ownerName = {post.owner.name} 
                 postId = {post._id}
                 caption= {post.caption}
                postImage = {post.image.url}
                 likes = {post.likes}
                 comments = {post.comments}
                 ownerImage = {post.owner.avatar.url}
                 ownerId ={post.owner._id}
                 isAccount ={true}
                 isDelete ={true}
      />
        )) : <Typography variant ="h5">You Have Not Made Any Posts</Typography>
    }
    
    
    
    </div>

    <div className ="accountright">
      <Avatar src ={user.avatar.url}
      sx = {{ height :"8vmax" , width :"8vmax"}} alt ={user.name} />

       <Typography variant ="h6"> {user.name} </Typography>  

       <div>
        <button onClick ={()=> setFollowersToggle(!followersToggle)}>
            <Typography>Followers</Typography>
        </button>
        <Typography>{user.followers.length}</Typography>
       </div>
        

       <div>
        <button onClick ={()=> setFollowingToggle(!followingToggle)}>
            <Typography>Following</Typography>
        </button>
        <Typography>{user.following.length}</Typography>
       </div>
        
       <div>
            <Typography>Posts</Typography>
        <Typography>{user.posts.length}</Typography>
       </div>
        
        <Button variant ="contained" onClick ={logoutHandler}>Logout</Button>
        
        <Link to ="/update/profile"> Edit Profile </Link>

        <Link to ="/update/password"> Change Password</Link>

        <Button disabled ={deleteLoading} variant ="text" onClick={deleteProfileHandler}
        style={{color:"red",margin:"2vmax"}}> Delete My Profile</Button>

<Dialog open ={followersToggle} onClose={()=> setFollowersToggle(!followersToggle)}>
<div className="DialogBox">
    <Typography variant="h4"> Followers </Typography>
    {
        user &&user.followers.length  > 0 ? (user.followers.map((follow)=>(
      <User
           key ={follow._id}
            userId = {follow._Id}
            name = {follow.following.name}
            avatar = {follow.avatar.url}
            />
        ))) : (<Typography style ={{margin:"2vmax"}}>You Hvae No Followers</Typography>)
    }
    

</div>

</Dialog>



<Dialog open ={followingToggle} onClose={()=> setFollowingToggle(!followingToggle)}>
<div className="DialogBox">
    <Typography variant="h4"> Followings </Typography>
    {
        user &&user.following.length  > 0 ? (user.following.map((follows)=>(
      <User
           key ={follows._id}
            userId = {follows._Id}
            name = {follows.name}
            avatar = {follows.avatar.url}
            />
        ))) : (<Typography style ={{marin:"2vmax"}}>You Hvae Not following anyone</Typography>)
    }
    

</div>

</Dialog>








        
         </div>

</div>
)

    
    
    
    
    
    
    
    
    
    
}

export default Account