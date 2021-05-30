import React from 'react';
import './App.css';
import './Styles/main.css'
import {NavBar} from './Components/NavBar/NavBar'
import {Footer} from './Components/Footer/Footer'
import {Lander} from './Components/Lander/Lander'

function App() {

  return (
    <div className="main-container">
        <NavBar />
        <Lander />
        <Footer />
    </div>
  );
}

export default App;
