import React, { useState } from 'react';
import "./chat.css";
import { Link } from "react-router-dom";

function Chat() {
  return (
  <>
  <div className='chat_box'>
  <div className='chat_up'>
    <div className='chat_Username'>Username</div>
    <p>online</p>
    </div>

    <div className='chat_down'>
        <input placeholder='Enter to chat' className='text_input'></input>
        <button>Send</button>
    </div>
    </div>
  </>
  );
}

export default Chat;



  