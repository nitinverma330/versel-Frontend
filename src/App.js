import React, { useState, useEffect } from 'react';
import QRGenerator from './components/QRGenerator';
import QRScanner from './components/QRScanner';
import Login from './components/Login';
import { QrCodeIcon, CameraIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView(JSON.parse(userData).role === 'teacher' ? 'generator' : 'scanner');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView(userData.role === 'teacher' ? 'generator' : 'scanner');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              QR Attendance System
            </h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'teacher' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation - Only show if teacher */}
        {user?.role === 'teacher' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div 
              onClick={() => setCurrentView('generator')}
              className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                currentView === 'generator' 
                  ? 'bg-white shadow-xl border-2 border-gray-800' 
                  : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  currentView === 'generator' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <QrCodeIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Generate QR Codes</h3>
                  <p className="text-sm text-gray-600">Create attendance sessions</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('scanner')}
              className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                currentView === 'scanner' 
                  ? 'bg-white shadow-xl border-2 border-gray-800' 
                  : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  currentView === 'scanner' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <CameraIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">View as Student</h3>
                  <p className="text-sm text-gray-600">Test student interface</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === 'generator' ? (
          user?.role === 'teacher' ? (
            <QRGenerator user={user} />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
              <UserCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600">Teacher access required for this section.</p>
            </div>
          )
        ) : (
          <QRScanner user={user} />
        )}
      </div>
    </div>
  );
}

export default App;