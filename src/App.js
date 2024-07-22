// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import SignIn from './components/SignIn';
import Notes from './components/Notes'; // Import your Notes component here
import Header from './components/Header';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/notes" element={<Notes />} /> {/* Add Notes route */}
                    {/* Add more routes here for other pages */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
