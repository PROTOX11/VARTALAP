import React from "react";
import "./leftcontent.css";
import { Link } from "react-router-dom";
function Leftcontent() {
    return (
        <div className="left-content-logged">
            
        <div className="logo">
        <h1>VARTALAP</h1>
        <input className="searchbar" placeholder="Search"></input>
        </div>
        <nav className="menu">
            <div className="but">Home</div>
            <div className="but">Search</div>
            <div className="but">Explore</div>
            <div className="but">Wow</div>
            <div className="but">Notification</div>
            <div className="but">Create</div>
            <Link to="/">
                <div className="but">Logout</div>    
            </Link>
        </nav>
        </div>
    )
}

export default Leftcontent;
