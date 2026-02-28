//import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';
import RacePage from './pages/RacePage';
import Battlefield from './pages/Battlefield';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/valdari" element={<RacePage race="valdari" />} />
        <Route path="/gorkar" element={<RacePage race="gorkar" />} />
        <Route path="/sylvaran" element={<RacePage race="sylvaran" />} />
        <Route path="/mortharim" element={<RacePage race="mortharim" />} />
        <Route path="/battle" element={<Battlefield race="valdari"  />} />
        
      </Routes>
    </Router>
  );
};

export default App;
