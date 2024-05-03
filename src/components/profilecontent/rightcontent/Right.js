import React from "react";
import "./right.css";
import like from "../../../assets/icon/like.png"
import comment from "../../../assets/icon/chat.png"
import share from "../../../assets/icon/share.png"
import profile from "../../../assets/profile/roushan.jpg"
import postimg from "../../../assets/post/user4/user4post1.png"
function Right() {
    return (
    <>
    <div>
        <div className="post">       
        <div class="post-box">
        <div class="user-info">
            <img src={profile} alt="Profile Picture"></img>
        <div>
            <div class="user-name">Roushan kumar</div>
            <div class="user-address">sector-18 chandigarh</div>
        </div>
        </div>
        <img src={postimg} className="post-image"></img>
        <p>feeling adventures</p>
        <div className="likecom">
            <img src={like} className="likes"></img>
            <img src={comment} className="comments"></img>
            <img src={share} className="shares"></img>
        </div>
        </div>
        </div>
    </div>
    </>
    )
    
}

export default Right;