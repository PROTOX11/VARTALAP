import React from "react";
import "./left.css";
import profile from "../../../assets/profile/roushan.jpg"
import home from "../../../assets/icon/home.png"
import { Link } from "react-router-dom";

function Left() {
    return (
    <>
    <div>
        <div className="profile-picture">
            <img src={profile} className="profilepic"></img>
            <div className="usernamepr">Roushan kumar</div>
        
        <div className="button">
            <button className="add">Add Friend</button>
            <button className="block">Block</button>
            <button className="message">Message</button>
        </div>
    </div>
    </div>
    <Link to="/Logged">
        <img src={home} className="home-button"></img>    
    </Link>
    </>
    )
    
}

export default Left;