import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
            <h1 className="text-4xl font-bold text-green-800 mb-4">Welcome to GreenTrack</h1>
            <p className="text-lg text-green-600 mb-8">Track, Verify, and Sustain our future.</p>
            <div className="space-x-4">
                <Link to="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-medium">
                    Login
                </Link>
                <Link to="/signup" className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg shadow hover:bg-green-50 transition font-medium">
                    Sign Up
                </Link>
            </div>
        </div>
    );
};
export default Home;
