import React from "react";
import "./scroll.css"   
import like from "../../assets/icon/like.png"
import comment from "../../assets/icon/chat.png"
import share from "../../assets/icon/share.png"
import { Link } from "react-router-dom";
import profile from "../../assets/post/user4/user4post2.png"
import postimg from "../../assets/post/user4/user4post2.png"



function scroll() {
    return (
        <>
           <input className="searchbar" placeholder="Search"></input>  
        <div class="post-box">
        <div class="user-info">
            <img src={profile} alt="Profile Picture"></img>
        <div>
            <Link to="/Profile">
                <div class="user-name">username</div>
            </Link>
            <div class="user-address">sector-18 chandigarh</div>
            <div className="likecom">
                    <img src={like} className="like"></img>
                    <img src={comment} className="comment"></img>
                    <img src={share} className="share"></img>
            </div>
        </div>
        </div>
        <img src={postimg} className="post-image"></img>
        <p>feeling adventures</p>
        </div>
        </>
    )
}
// import { formToJSON } from "axios";

export default scroll;