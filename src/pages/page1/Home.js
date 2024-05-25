import React, { useState } from "react";
import './home.css';
import arrow from "../../assets/icon/arrow.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Home() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log('handleLogin invoked');
    try {
      const response = await axios.post('http://localhost:4500/api/v1/user/login', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Redirect to profile page upon successful login
      navigate('/Logged'); // Use navigate directly
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error (e.g., display error message to user)
    }
  };

  return (
    <div>
      <h1 className="headline">VARTALAP</h1>
      <div className="logdet">Enter your login details</div>
      <div id="input">
        <form onSubmit={handleLogin}>
          <input
            className="usernames"
            type="text"
            placeholder="Username, Mobile Number or Email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}/>
          <input
            className="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
            <button type="submit" className="logposL">
              <img src={arrow} alt="Login_button" />
            </button>
        </form>
      </div>
      <div className="register-box">
        <Link to="/Register">
          <div className="register-button">Create New Account</div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
