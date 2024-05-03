import React from 'react';
import './App.css';
// import Chat from "./pages/page5/Chat";
import Home from "./pages/page1/Home";
import Logged from "./pages/page2/Logged";
import Profile from "./pages/page3/Profile";
import  Register from "./pages/page4/Register";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route path='/' element={<Chat />}/> */}
          <Route path='/' element={<Home />}/>
          <Route path='/Logged' element={<Logged/>}/>
          <Route path='/Profile' element={<Profile />}/>
          <Route path='/Register' element={<Register />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
