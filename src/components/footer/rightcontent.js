import React from "react";
import "./rightcontent.css"
import squirrel from "../../assets/profile/squirrel.jpeg"
import activeuser1 from "../../assets/profile/Screenshot (5).png"
import activeuser2 from "../../assets/profile/Screenshot (6).png"
import activeuser3 from "../../assets/profile/Screenshot (7).png"
import activeuser4 from "../../assets/profile/roushan.jpg"
import activeuser5 from "../../assets/profile/ankit.jpg";
import { Link } from "react-router-dom";
function rightcontent() {
    return (
        <div className="rightmat">
        <div>
            <img src={squirrel} className="profilelogo"></img>
        </div>
        <div className="activeusers">
        <Link to="/Profile">
        <img src={activeuser1} className="activeuser"></img>    
        </Link>
        <Link to="/Profile">
        <img src={activeuser2} className="activeuser"></img>    
        </Link>
        <Link to="/Profile">
        <img src={activeuser3} className="activeuser"></img>    
        </Link>
        <Link to="/Profile">
        <img src={activeuser4} className="activeuser"></img>    
        </Link>
        <Link to="/Profile">
        <img src={activeuser5} className="activeuser"></img>    
        </Link>
        </div>
        </div>
    )
}

export default rightcontent;
