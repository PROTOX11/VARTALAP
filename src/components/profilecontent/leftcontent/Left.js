import React from "react";
import "./left.css";
import profile from "../../../assets/profile/roushan.jpg"
import backprofile from "../../../assets/post/user4/user4post2.png"
import home from "../../../assets/icon/home.png"
import { Link } from "react-router-dom";

function Left() {
    return (
    <>
    <div className="profile-picture">
            <div className="usernamepr">Username</div>
        <div className="button">
            <button className="add">Add Friend</button>
            <button className="block">Block</button>
            <button className="message">Message</button>
        </div>
    </div>
    <div class="container">
        <img src={backprofile} alt="Background Profile" class="backprofile"></img>
        <img src={profile} alt="Circular Profile" class="circle_profile"></img>
    </div>

    {/* <Link to="/Logged">
        <img src={home} className="home-button"></img>    
    </Link> */}
    </>
    )
    
}

export default Left;