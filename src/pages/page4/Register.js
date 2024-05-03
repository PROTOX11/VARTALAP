import React, { useState } from 'react';
import arrow from "../../assets/icon/arrow.png";
import "./register.css";
import axios from 'axios';
import { Link } from "react-router-dom";

function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    mobile_number: '',
    password: ''
  });

  const [text, setText] = useState('Create account');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4500/api/v1/user/new', formData);
      console.log('Response:', response); 
      setText('Account created successfully');
      setFormData({ username: '', mobile_number: '', password: '' });
    } catch (error) {
      console.error('Error creating account:', error);
      setText('Account created successfully');
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="headline">VARTALAP</h1>
      <div className="logdet">Enter your Register details</div>
      <div id="input">
        <input type='text' name="username" className="usernames" value={formData.username} placeholder="Create Username" onChange={handleChange}></input>
        <input type='text' name="mobile_number" className="emails" value={formData.mobile_number} placeholder="Mobile Number or Email" onChange={handleChange}></input>
        <input type='password' name="password" className="password" value={formData.password} placeholder="Password" onChange={handleChange}></input>
      </div>
      <div className="logpos">
        <button type="submit" className="logged">
          <p>{text}</p>
        </button>
      </div>
      <Link to="/">
        <img src={arrow} alt="arrow" className='arrow-size'></img>
      </Link>
    </form>
  );
}

export default UserRegistrationForm;



  