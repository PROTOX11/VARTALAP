import React, { useState } from 'react';
import "./leftcontent.css";
import { useNavigate } from 'react-router-dom';
import SearchBar from '../mini_components/SearchBar/SearchBar';

function Leftcontent() {
    const navigate = useNavigate();
    const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

    const handleLogout = () => {
        // Clear JWT from local storage
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/');
    };

    const toggleSearchBar = () => {
        setIsSearchBarVisible(!isSearchBarVisible);
    };

    return (
      <div>
        <div className="left-content-log">
            <h1>VARTALAP</h1>
            <nav className="menu">
                <button className="but">Home</button>
                <button className="but" onClick={toggleSearchBar}>Search</button>
                <button className="but">Explore</button>
                <button className="but">Wow</button>
                <button className="but">Notification</button>
                <button className="but">Create</button>
                <button className="logout_but" onClick={handleLogout}>Logout</button>
            </nav>
            </div>
            <div>
            {isSearchBarVisible && (
              <div>
                  <SearchBar/>
                </div>
            )}
            </div>
        </div>
    );
}

export default Leftcontent;
