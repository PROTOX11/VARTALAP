import React, { useState } from "react";
import "./left.css";
import arrow from "../../../assets/icon/arrow.png";
import profile from "../../../assets/profile/roushan.jpg";
import backprofile from "../../../assets/post/user4/user4post2.png";
import { Link } from "react-router-dom";
import UseUserData from "../../../models/useUserData";

function Left() {
    const userData = UseUserData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        console.log("Update username button clicked"); // Log to check event trigger
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleUpdateUsername = () => {
        console.log("Username updated"); // Log to check update logic
        // Handle username update logic here
        setIsDialogOpen(false);
    };

    return (
        <>
            <Link to="/logged">
                <button className="righttoback">
                    <img src={arrow} className="backimg" alt="Back" />
                </button>
            </Link>
            <div className={`container ${isDialogOpen ? "blur-background" : ""}`}>
                <div className="transparent-image">
                    <img src={backprofile} alt="Background Profile" className="backprofile" />
                </div>
                <img src={profile} alt="Circular Profile" className="circle_profile" />
                {userData && userData.username && (
                    <div className="usernamepr">{userData.username}</div>
                )}
                <div className="threebutuser">
                    <button className="add">Update profile</button>
                    <button className="block" onClick={handleOpenDialog}>Update username</button>
                    <button className="message">Update Cover</button>
                </div>
                <div className="about_line">
                    <span>About</span>
                    <p>I am a student of India</p>
                    <p>I am a student of India</p>
                    <p>I am a student of India</p>
                    <p>I am a student of India</p>
                    <p>I am a student of India</p>
                </div>
            </div>
            {isDialogOpen && (
                <div className="dialog">
                    <div className="dialog-content">
                        <input className="inputname"></input>
                        <p>Are you sure you want to change your username?</p>
                        <button className="buttonok" onClick={handleUpdateUsername}>OK</button>
                        <button className="buttonok" onClick={handleCloseDialog}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Left;
