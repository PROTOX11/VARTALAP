import React from "react";
import "./leftcontent.css";
import { useNavigate } from 'react-router-dom';
function Leftcontent() {
    const navigate = useNavigate();

  const handleLogout = () => {
    // Clear JWT from local storage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };
    return (
        <div className="left-content-logged">  
        <h1>VARTALAP</h1>
        <nav className="menu">
            <div className="but">Home</div>
            <div className="but">Search</div>
            <div className="but">Explore</div>
            <div className="but">Wow</div>
            <div className="but">Notification</div>
            <div className="but">Create</div>
            <button className="logout_but" onClick={handleLogout}> Logout</button>
        </nav>
        </div>
    )
}

export default Leftcontent;
