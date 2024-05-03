import React, { useState } from "react"
import './home.css';
import arrow from "../../assets/icon/arrow.png"
import { Link } from "react-router-dom";
// import axios from "axios"



function Home() {
  return (
    <div>
      <h1 className="headline">VARTALAP</h1>
      <div className="logdet">Enter your login details</div>
      <div id="input">
      <input className="usernames" placeholder="Username,Mobile Number or Email"></input>
        <input className="password" placeholder="Password"></input>
      </div>
      <div className="logpos">
            <Link to="/Logged" className="logged">
              <img src={arrow}></img>
            </Link>
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



// function data() {
//   const [userName, setUserName] = useState('')

//   async function submit(error){
//     e.preventdefault()
//     try {
      
//     } catch (error) {
      
//     }
//   }
// }
