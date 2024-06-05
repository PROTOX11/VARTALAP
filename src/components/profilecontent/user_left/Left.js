import React from "react";
import { useParams } from 'react-router-dom';
import "./left.css";
import arrow from "../../../assets/icon/arrow.png";
import profile from "../../../assets/profile/roushan.jpg"
import backprofile from "../../../assets/post/user4/user4post2.png"
import { Link } from "react-router-dom";
// import UseUserData from "../../../models/useUserData";
function Left() {
    const { friendName } = useParams();
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
    <div className="usernamepr">{friendName}</div>
            <div className="threebutfriend">
            <button className="add">Add Friend</button>
            <button className="block">Block</button>
            <button className="message">Message</button>
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