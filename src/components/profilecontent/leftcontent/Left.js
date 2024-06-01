import React from "react";
import "./left.css";
import arrow from "../../../assets/icon/arrow.png";
import profile from "../../../assets/profile/roushan.jpg"
import backprofile from "../../../assets/post/user4/user4post2.png"
import home from "../../../assets/icon/home.png"
import { Link } from "react-router-dom";
import useUserData from "../../../models/useUserData";
function Left() {
    const userData = useUserData();
    return (
    <>
    <Link to="/logged">
    <button className="righttoback">
        <img src={arrow} className="backimg" ></img>
    </button>
    </Link>
    <div class="container">
        <div className="transparent-image">
        <img src={backprofile} alt="Background Profile" class="backprofile"></img>
        </div>
        <img src={profile} alt="Circular Profile" class="circle_profile"></img>
    </div>
    {userData && userData.username &&(
    <div className="usernamepr">{userData.username}</div>
    )}
        <div className="button">
            <button className="add">Add Friend</button>
            <button className="block">Block</button>
            <button className="message">Message</button>
        </div>
        <span>about</span>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>

    </>
    )
    
}

export default Left;