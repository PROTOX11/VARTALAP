import React from 'react';
import './App.css';
import CustomRouteGuard from './components/guard/Routeguard';
import AuthGuard from './components/guard/Authguard';
import Home from "./pages/page1/Home";
import Logged from "./pages/page2/Logged";
import Profile from "./pages/page3/Profile";
import Register from "./pages/page4/Register";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/logged" element={<CustomRouteGuard><Logged /></CustomRouteGuard>} />
          <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />
          <Route path="/profile" element={<CustomRouteGuard><Profile /></CustomRouteGuard>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
