import React, { useState, useEffect } from 'react';

const QRScanner = ({ user }) => {
  const [message, setMessage] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    roll: ''
  });
  const [studentStats, setStudentStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [statsRoll, setStatsRoll] = useState('');

const API_BASE_URL = 'https://versel-backend-henna.vercel.app/api';
  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Auto-fill student info if user is logged in as student
  useEffect(() => {
    if (user && user.role === 'student') {
      setStudentInfo({
        name: user.name,
        roll: user.username
      });
    }
  }, [user]);

  const showMessage = (msg, ok = true) => {
    setMessage({ text: msg, type: ok ? 'ok' : 'err' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save attendance to MongoDB
  const saveAttendanceToDB = async (data) => {
    try {
      console.log('📤 Sending attendance data to server:', data);
      
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      const result = await response.json();
      console.log('📥 Server response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Network error saving attendance:', error);
      return { 
        status: 'error', 
        message: error.message || 'Network error: Could not connect to server' 
      };
    }
  };

  // Get student attendance statistics
  const getStudentStats = async (rollNumber) => {
    try {
      console.log(`📊 Fetching stats for student: ${rollNumber}`);
      
      const response = await fetch(`${API_BASE_URL}/student-stats/${rollNumber}`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('📈 Student stats:', result.data);
        return { status: 'success', data: result.data };
      } else {
        return { status: 'error', message: result.message };
      }
    } catch (error) {
      console.error('❌ Error fetching student stats:', error);
      return { status: 'error', message: error.message || 'Network error' };
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentInfo.name.trim()) {
      showMessage("Name is required", false);
      return;
    }
    
    if (!studentInfo.roll.trim()) {
      showMessage("Roll number is required", false);
      return;
    }

    const now = new Date();
    const data = {
      name: studentInfo.name,
      roll: studentInfo.roll,
      session: scannedData.session || scannedData,
      course: scannedData.course || 'N/A',
      section: scannedData.section || 'N/A',
      subject: scannedData.subject || 'N/A',
      faculty: scannedData.faculty || 'N/A',
      time: scannedData.time || 'N/A',
      date: scannedData.date || now.toLocaleDateString(),
      note: scannedData.note || '',
      scanTime: now.toLocaleTimeString(),
      timestamp: now.toISOString()
    };

    showMessage("⏳ Marking attendance for " + data.name + " — please wait...");

    // Save to MongoDB
    const result = await saveAttendanceToDB(data);
    
    if (result.status === 'success') {
      showMessage(`✅ Attendance marked successfully for ${data.name} (Roll: ${data.roll})`);
      
      // Get student statistics after marking attendance
      const statsResult = await getStudentStats(data.roll);
      if (statsResult.status === 'success') {
        setStudentStats(statsResult.data);
        setShowStats(true);
      }
      
      // Reset form and close it
      setStudentInfo({ name: '', roll: '' });
      setShowForm(false);
      setScannedData(null);
    } else {
      showMessage(`❌ Error: ${result.message}`, false);
    }
  };

  const handleStatsFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!statsRoll.trim()) {
      showMessage("Roll number is required", false);
      return;
    }

    showMessage("⏳ Fetching your attendance statistics...");
    
    const result = await getStudentStats(statsRoll);
    if (result.status === 'success') {
      setStudentStats(result.data);
      setShowStats(true);
      setShowStatsForm(false);
      setStudentInfo(prev => ({ ...prev, roll: statsRoll }));
    } else {
      showMessage(`❌ Error: ${result.message}`, false);
    }
  };

  const startScanner = () => {
    if (!window.Html5Qrcode) {
      showMessage('QR scanner library not loaded yet. Please wait...', false);
      return;
    }

    const html5QrCode = new window.Html5Qrcode("reader");

    const onScanSuccess = (decodedText, decodedResult) => {
      html5QrCode.stop().then(() => {
        setIsCameraOn(false);
      }).catch(() => {});

      let payload;
      try {
        payload = JSON.parse(decodedText);
        console.log('📱 QR Code scanned successfully:', payload);
      } catch (e) {
        payload = { session: decodedText };
        console.log('📱 QR Code scanned (plain text):', decodedText);
      }

      // Store scanned data and show form instead of alerts
      setScannedData(payload);
      setShowForm(true);
      showMessage("✅ QR scanned successfully! Please fill your details below.");
    };

    const onScanFailure = (error) => {
      console.log('❌ QR Scan failed:', error);
    };

    window.Html5Qrcode.getCameras().then(devices => {
      const cameraId = (devices && devices.length) ? devices[0].id : null;
      html5QrCode.start(
        cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        onScanFailure
      ).then(() => {
        setIsCameraOn(true);
        showMessage("📷 Camera started successfully! Point at QR code.");
      }).catch(err => {
        console.error('❌ Camera start error:', err);
        showMessage('❌ Could not start camera: ' + err, false);
      });
    }).catch(err => {
      console.error('❌ Camera detection error:', err);
      showMessage('❌ No camera found. Please check your device permissions.', false);
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setShowStatsForm(false);
    // Don't reset student info if user is logged in
    if (!user || user.role !== 'student') {
      setStudentInfo({ name: '', roll: '' });
    }
    setScannedData(null);
    setShowStats(false);
    setStudentStats(null);
    setStatsRoll('');
  };

  const openStatsForm = () => {
    if (user && user.role === 'student') {
      // Auto-fill for logged-in students
      setStatsRoll(user.username);
      handleStatsFormSubmit({ preventDefault: () => {} });
    } else {
      setShowStatsForm(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Attendance — Student</h1>
      
      {/* Welcome Message for Student */}
      {user && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Welcome, {user.name}!</h3>
              <p className="text-gray-700 text-sm">Roll Number: {user.username}</p>
              {user.course && user.section && (
                <p className="text-gray-700 text-sm">Course: {user.course} - Section {user.section}</p>
              )}
            </div>
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
              Student
            </span>
          </div>
        </div>
      )}
      
      {/* View Statistics Button */}
      <div className="mb-6">
        <button 
          onClick={openStatsForm}
          className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-colors font-medium"
        >
          📊 View My Attendance Statistics
        </button>
      </div>
      
      {!isCameraOn && !showForm && !showStats && !showStatsForm && (
        <button 
          onClick={startScanner}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-colors font-medium mb-6"
        >
          Start Camera & Scan QR
        </button>
      )}
      
      <div id="reader" className="mx-auto w-80"></div>
      
      {/* Statistics Form Modal */}
      {showStatsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">View Attendance Statistics</h2>
              <button 
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleStatsFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="statsRoll" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Roll Number *
                  </label>
                  <input
                    type="text"
                    id="statsRoll"
                    name="statsRoll"
                    value={statsRoll}
                    onChange={(e) => setStatsRoll(e.target.value)}
                    placeholder="Enter your roll number (e.g., BC2023003)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your student ID to view your attendance statistics
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors font-medium"
                >
                  View Statistics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Student Statistics Modal */}
      {showStats && studentStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900">My Attendance Statistics</h2>
              <button 
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 text-center">
                    <div className="text-3xl font-bold text-gray-800">{studentStats.attendedLectures}</div>
                    <div className="text-sm text-gray-700 font-medium">Lectures Attended</div>
                    <div className="text-xs text-gray-600 mt-1">Total sessions you attended</div>
                  </div>
                  
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 text-center">
                    <div className="text-3xl font-bold text-gray-800">{studentStats.totalLectures}</div>
                    <div className="text-sm text-gray-700 font-medium">Total Lectures</div>
                    <div className="text-xs text-gray-600 mt-1">All sessions conducted</div>
                  </div>
                  
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 text-center">
                    <div className="text-3xl font-bold text-gray-800">{studentStats.attendancePercentage}%</div>
                    <div className="text-sm text-gray-700 font-medium">Attendance Percentage</div>
                    <div className="text-xs text-gray-600 mt-1">Your overall attendance</div>
                  </div>
                </div>
                
                {/* Attendance Progress Bar */}
                <div className="bg-white p-6 rounded-lg border border-gray-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
                    <span className="text-sm font-bold text-gray-800">{studentStats.attendancePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gray-800 h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${studentStats.attendancePercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Student Information */}
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                  <h3 className="font-semibold text-gray-800 mb-3">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Roll Number:</span>
                      <span className="font-medium ml-2">{studentInfo.roll}</span>
                    </div>
                    {studentInfo.name && (
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium ml-2">{studentInfo.name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ml-2 ${
                        parseFloat(studentStats.attendancePercentage) >= 75 ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {parseFloat(studentStats.attendancePercentage) >= 75 ? 'Good Standing' : 'Need Improvement'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium ml-2">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Recent Attendance History */}
                {studentStats.recentAttendance.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-gray-300">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Attendance History</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {studentStats.recentAttendance.map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-300">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                              <span className="font-medium text-gray-800">{record.session}</span>
                            </div>
                            <div className="text-sm text-gray-600 ml-4">
                              {record.course} • {record.subject} • {record.faculty}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">{record.date}</div>
                            <div className="text-xs text-gray-500">{record.scanTime}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {studentStats.allRecords.length > 10 && (
                      <p className="text-sm text-gray-500 text-center mt-3">
                        Showing last 10 of {studentStats.allRecords.length} records
                      </p>
                    )}
                  </div>
                )}
                
                {/* Attendance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-2">Attendance Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Required Attendance (75%):</span>
                        <span className="font-medium">{(studentStats.totalLectures * 0.75).toFixed(0)} lectures</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Current Status:</span>
                        <span className={`font-medium ${
                          studentStats.attendedLectures >= (studentStats.totalLectures * 0.75) ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {studentStats.attendedLectures >= (studentStats.totalLectures * 0.75) ? 'Above Requirement' : 'Below Requirement'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-2">Quick Actions</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">Need to improve your attendance?</p>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Attend all scheduled lectures</li>
                        <li>• Mark attendance regularly</li>
                        <li>• Contact faculty if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 border-t border-gray-300 bg-gray-100">
              <button
                onClick={closeForm}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowStats(false);
                  setShowForm(true);
                }}
                className="flex-1 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors font-medium"
              >
                Mark Today's Attendance
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Enter Your Details</h2>
              <button 
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {scannedData && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-2">Class Information:</h3>
                <div className="text-sm text-gray-700">
                  {scannedData.course && <p><strong>Course:</strong> {scannedData.course}</p>}
                  {scannedData.section && <p><strong>Section:</strong> {scannedData.section}</p>}
                  {scannedData.subject && <p><strong>Subject:</strong> {scannedData.subject}</p>}
                  {scannedData.faculty && <p><strong>Faculty:</strong> {scannedData.faculty}</p>}
                  {scannedData.date && <p><strong>Date:</strong> {scannedData.date}</p>}
                  {scannedData.time && <p><strong>Time:</strong> {scannedData.time}</p>}
                </div>
              </div>
            )}
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={studentInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    required
                    readOnly={user && user.role === 'student'} // Read-only for logged-in students
                  />
                  {user && user.role === 'student' && (
                    <p className="text-xs text-gray-500 mt-1">Name is auto-filled from your profile</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="roll" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number / ID *
                  </label>
                  <input
                    type="text"
                    id="roll"
                    name="roll"
                    value={studentInfo.roll}
                    onChange={handleInputChange}
                    placeholder="Enter your roll number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    required
                    readOnly={user && user.role === 'student'} // Read-only for logged-in students
                  />
                  {user && user.role === 'student' && (
                    <p className="text-xs text-gray-500 mt-1">Roll number is auto-filled from your profile</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors font-medium"
                >
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'ok' 
              ? 'bg-gray-100 border-gray-300 text-gray-800' 
              : 'bg-gray-100 border-gray-300 text-gray-800'
          }`}>
            <div className="flex items-start">
              {message.type === 'ok' ? (
                <span className="text-gray-600 mr-2">✅</span>
              ) : (
                <span className="text-gray-600 mr-2">❌</span>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-6 text-sm text-gray-600">
        Allow camera access. When QR is scanned, you'll be prompted to enter your details in a form.
      </p>
      
      {/* Login Info for Students */}
      {!user && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">Student Login Information</h3>
          <p className="text-gray-700 text-sm">
            Use your roll number as username and "student123" as password to login.
            Your profile will be automatically created on first login.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
