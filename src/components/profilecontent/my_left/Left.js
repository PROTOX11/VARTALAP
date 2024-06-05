import React from "react";
import "./left.css";
import arrow from "../../../assets/icon/arrow.png";
import profile from "../../../assets/profile/roushan.jpg"
import backprofile from "../../../assets/post/user4/user4post2.png"
import home from "../../../assets/icon/home.png"
import { Link } from "react-router-dom";
import UseUserData from "../../../models/useUserData";
import pencil from "../../../assets/icon/pencil.png"
function Left() {
    const userData = UseUserData();
    return (
    <>
    <Link to="/logged">
    <button className="righttoback">
        <img src={arrow} className="backimg" ></img>
    </button>
    </Link>
    <div className="container">
        <div className="transparent-image">
        <img src={backprofile} alt="Background Profile" className="backprofile"></img>
        </div>
        <img src={profile} alt="Circular Profile" className="circle_profile"></img>
    </div>
    {userData && userData.username &&(
    <div className="usernamepr">{userData.username}</div>
    )}
            <div className="threebutuser">
            <button className="add">Update profile</button>
            <button className="block">Update username</button>
            <button className="message">Update Cover</button>
            </div>
        <div className="about_line">
        <span>About</span>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        <p>i am student of the india</p>
        </div>
    </>
    )
    
}

export default Left;