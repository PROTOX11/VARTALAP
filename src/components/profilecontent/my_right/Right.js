import React from "react";
import "./right.css";
import like from "../../../assets/icon/like.png"
import comment from "../../../assets/icon/chat.png"
import share from "../../../assets/icon/share.png"
import profile from "../../../assets/post/user4/user4post.png"
import postimg from "../../../assets/post/user4/user4post1.png"
function Right() {
    return (
    <>
    <div>
    <div className="rightup">
        <div className="friends">Friends</div>
        <div className="mini_icon">    
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        <img src={postimg} ></img>
        </div>
    </div>
    <div className="profile_post">Post</div>
    <div className="post_area">
        <div className="postingrid">
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
            <img src={profile} ></img>
        </div>
    </div>
    </div>
    </>
    )
    
}

export default Right;