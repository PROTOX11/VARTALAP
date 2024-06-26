import React from 'react';
import './App.css';
import CustomRouteGuard from './components/guard/Routeguard';
import AuthGuard from './components/guard/Authguard';
import Home from "./pages/page1/Home";
import Logged from "./pages/page2/Logged";
import Profile from "./pages/page3/user_Profile";
import Register from "./pages/page4/Register";
import MyProfile from "./pages/page6/my_Profiles"; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UseUserData from "./models/useUserData";

const App = () => {
  const userData = UseUserData();
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/logged" element={<CustomRouteGuard><Logged /></CustomRouteGuard>} />
          <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />
          {userData && userData.friends.map((friend, index) => (
            <Route
              key={index} // Add key prop here
              path={`/user_profile/${friend.name}`}
              element={<CustomRouteGuard><Profile /></CustomRouteGuard>}
            />
          ))}
          <Route path="/myprofile" element={<CustomRouteGuard><MyProfile /></CustomRouteGuard>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
