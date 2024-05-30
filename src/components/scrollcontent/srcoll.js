import React from "react";
import "./scroll.css"   
import arrow from "../../assets/icon/arrow.png"
import like from "../../assets/icon/like.png"
import comment from "../../assets/icon/chat.png"
import share from "../../assets/icon/share.png"
import { Link } from "react-router-dom";
import profile from "../../assets/post/user4/user4post2.png"
import postimg from "../../assets/post/user4/user4post2.png"



function scroll() {
    return (
        <>
           <div>
           <input className="searchbar" placeholder="Search"></input>
           </div>
        <div class="post-box">
        <div class="user-info">
            <img src={profile} alt="Profile Picture"></img>
        <div>
            <Link to="/Profile">
                <div class="user-name">Roushan kumar</div>
            </Link>
            <div class="user-address">sector-18 chandigarh</div>
        </div>
        </div>
        <div className="post-image">
        <img src={postimg}className="main-post"></img>
        </div>
            <hr className="lineunderpost" ></hr>
        <div className="bottom-area">
        <div class="likecom">
        <div class="action">
            <img src={like} alt="Like" class="icon"></img>
            <span class="text">Like</span>
        </div>
        <div class="action">
            <img src={comment} alt="Comment" class="icon"></img>
            <span class="text">Comment</span>
        </div>
        <div class="action">
            <img src={share} alt="Share" class="icon"></img>
            <span class="text">Share</span>
        </div>
    </div>
            </div>
            <hr className="lineundercomment" ></hr>
            <div className="allcomments">View all 100 comments</div>
            <div class="comment-container">
                <input className="usercommented" placeholder="Add a comment"></input>
            <img src={arrow} alt="Send" class="send-button"></img>
            </div>
        </div>
        </>
    )
}
// import { formToJSON } from "axios";

export default scroll;