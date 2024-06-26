import React from "react";
import "./right.css";
import profile from "../../../assets/post/user4/user4post.png";
import postimg from "../../../assets/post/user4/user4post1.png";

function Right() {
    return (
        <div>
            <div className="rightup">
                <div className="friends">Friends</div>
                <div className="mini_icon">
                    <img src={postimg} alt="Friend 1" />
                    <img src={postimg} alt="Friend 2" />
                    <img src={postimg} alt="Friend 3" />
                    <img src={postimg} alt="Friend 4" />
                    <img src={postimg} alt="Friend 5" />
                    <img src={postimg} alt="Friend 6" />
                    <img src={postimg} alt="Friend 7" />
                    <img src={postimg} alt="Friend 8" />
                    <img src={postimg} alt="Friend 9" />
                    <img src={postimg} alt="Friend 10" />
                </div>
            </div>
            <div className="profile_post">Post</div>
            <div className="post_area">
                <div className="postingrid">
                    <img src={profile} alt="Post 1" />
                    <img src={profile} alt="Post 2" />
                    <img src={profile} alt="Post 3" />
                    <img src={profile} alt="Post 4" />
                    <img src={profile} alt="Post 5" />
                    <img src={profile} alt="Post 6" />
                    <img src={profile} alt="Post 7" />
                    <img src={profile} alt="Post 8" />
                    <img src={profile} alt="Post 9" />
                    <img src={profile} alt="Post 10" />
                    <img src={profile} alt="Post 11" />
                    <img src={profile} alt="Post 12" />
                </div>
            </div>
        </div>
    );
}

export default Right;
