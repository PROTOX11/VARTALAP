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
    const [newUsername, setNewUsername] = useState("");

    const handleOpenDialog = () => {
        console.log("Update username button clicked"); // Log to check event trigger
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleUpdateUsername = async () => {
        try {
            const response = await fetch('http://localhost:4500/api/v1/update-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userData._id, newUsername }),
            });
    
            if (response.ok) {
                console.log("Username updated successfully");
                setIsDialogOpen(false);
            } else {
                console.error("Failed to update username:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating username:", error);
        }
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
                        <input 
                            className="inputname"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                        />
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
