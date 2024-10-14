import React from "react";
import "./rightcontent.css"
import squirrel from "../../assets/profile/squirrel.jpeg"
import UseUserData from "../../models/useUserData";
import { Link } from "react-router-dom";
function rightcontent() {
    const userData = UseUserData();
    return (
        <div className="rightmat">
        <Link to="/myprofile">
        <div>
            <img src={squirrel} className="profile-logo" alt="Profile Logo" />
        </div>
        </Link>
        <div className="active-users">
            {userData && userData.friends.map((friend, index) => (
            <Link key={index} to={`/user_profile/${friend}`}>
            <div>{friend}</div>
            </Link>
            ))}
        </div>
    </div>
    )
}

export default rightcontent;
