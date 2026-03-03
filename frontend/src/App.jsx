import React, { useState } from 'react';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import './App.css';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [navigationData, setNavigationData] = useState(null);

    const handleNavigate = (page, data = null) => {
        setNavigationData(data);
        setCurrentPage(page);
    };

    return (
        <div className="App">
            {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
            {currentPage === 'lobby' && <Lobby onNavigate={handleNavigate} roomData={navigationData} />}
            {currentPage === 'game' && <Game onNavigate={handleNavigate} gameData={navigationData} />}
        </div>
    );
}
