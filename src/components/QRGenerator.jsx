import React, { useState, useEffect } from 'react';
import { DocumentChartBarIcon, QrCodeIcon, ClipboardDocumentIcon, UsersIcon, ClockIcon, CalendarIcon, TrashIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, EyeIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const QRGenerator = ({ user }) => {
  const [formData, setFormData] = useState({
    session: '',
    course: '',
    section: '',
    time: '',
    date: '',
    faculty: '',
    subject: '',
    note: ''
  });

  const [qrResult, setQrResult] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('present');

  const API_BASE_URL = 'http://localhost:5000/api';

  const courses = ['BCA', 'MCA', 'B.Tech', 'M.Tech', 'B.Sc', 'M.Sc'];
  const sections = ['A', 'B', 'C', 'D'];
  const subjects = ['MERN-Fullstack', 'DataWarehousing', 'AI', 'GraphTheory', 'DBMS', 'OS', 'Networks'];
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM', 
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM'
  ];

  // Complete student list
  const allStudents = [
    { "student_id": "BC2023003", "name": "AYUSH AGARWAL" },
    { "student_id": "BC2023022", "name": "ANKIT KUMAR MAURYA" },
    { "student_id": "BC2023034", "name": "NISHTHA AGARWAL" },
    { "student_id": "BC2023037", "name": "ABHAY MISHRA" },
    { "student_id": "BC2023038", "name": "RONIT MAURYA" },
    { "student_id": "BC2023051", "name": "DHARMESH KUSHWAHA" },
    { "student_id": "BC2023060", "name": "PAVAS SHARMA" },
    { "student_id": "BC2023064", "name": "KABIR MOHSIN" },
    { "student_id": "BC2023071", "name": "DIVYANSH PANDEY" },
    { "student_id": "BC2023072", "name": "AKSHAT CHANDAK" },
    { "student_id": "BC2023116", "name": "PANKAJ RATHOUR" },
    { "student_id": "BC2023129", "name": "PRAKASH MISHRA" },
    { "student_id": "BC2023177", "name": "ANUSHKA TANDON" },
    { "student_id": "BC2023189", "name": "ANUJ KUSHWAHA" },
    { "student_id": "BC2023204", "name": "HARSHITA CHAND" },
    { "student_id": "BC2023205", "name": "AMISHA CHAND" },
    { "student_id": "BC2023210", "name": "CHAHNA CHAND" },
    { "student_id": "BC2023215", "name": "MRADUL SHARMA" },
    { "student_id": "BC2023219", "name": "PALAK KUMARI" },
    { "student_id": "BC2023223", "name": "AMAN VERMA" },
    { "student_id": "BC2023233", "name": "KUMARI SONI" },
    { "student_id": "BC2023238", "name": "AYAN KHAN" },
    { "student_id": "BC2023251", "name": "SHAZEEM KHAN" },
    { "student_id": "BC2023254", "name": "SAKSHAM SHARMA" },
    { "student_id": "BC2023255", "name": "SHIVAM PRAJAPATI" },
    { "student_id": "BC2023257", "name": "HARSHIT MISHRA" },
    { "student_id": "BC2023262", "name": "AASTIK MISHRA" },
    { "student_id": "BC2023265", "name": "KUSHAGRA GANGWAR" },
    { "student_id": "BC2023270", "name": "MOHD YASIR" },
    { "student_id": "BC2023284", "name": "MOHD ADNAN ASHRAF" },
    { "student_id": "BC2023285", "name": "MOHSIN" },
    { "student_id": "BC2023290", "name": "MADHU KUMARI" },
    { "student_id": "BC2023326", "name": "ARYAN GANGWAR" },
    { "student_id": "BC2023327", "name": "KAUSHAL KUMAR" },
    { "student_id": "BC2023329", "name": "AMAN KUMAR" },
    { "student_id": "BC2023330", "name": "VINEET PUNDHIR" },
    { "student_id": "BC2023333", "name": "MANDEEP KUMAR" },
    { "student_id": "BC2023335", "name": "AYUSH SHARMA" },
    { "student_id": "BC2023338", "name": "SAMI KHAN" },
    { "student_id": "BC2023339", "name": "NITIN VERMA" },
    { "student_id": "BC2023342", "name": "MANAS GANGWAR" },
    { "student_id": "BC2023348", "name": "NIRANJAN SINGH RAWAT" },
    { "student_id": "BC2023351", "name": "RYYAN KHAN" },
    { "student_id": "BC2023355", "name": "MUSKAN VERMA" },
    { "student_id": "BC2023358", "name": "VIKAS SHARMA" },
    { "student_id": "BC2023364", "name": "VIKAS VERMA" },
    { "student_id": "BC2023375", "name": "SHIVANI VERMA" },
    { "student_id": "BC2023380", "name": "SONU RAJPOOT" },
    { "student_id": "BC2023396", "name": "ALOK YADAV" },
    { "student_id": "BC2023397", "name": "LALIT SHARMA" },
    { "student_id": "BC2023406", "name": "RITIK SHUKLA" },
    { "student_id": "BC2023414", "name": "SHRUTYANSH MOHAN PATHAK" },
    { "student_id": "BC2023425", "name": "RUDRANSH DWIVEDI" },
    { "student_id": "BC2023427", "name": "ANSHI SINGH" },
    { "student_id": "BC2023428", "name": "LAVI SINGH" },
    { "student_id": "BC2023429", "name": "ABHISHEK SINGH" },
    { "student_id": "BC2023434", "name": "SIMRAN VERMA" },
    { "student_id": "BC2023436", "name": "PRANJAL VERMA" },
    { "student_id": "BC2023441", "name": "AJAY DEV" },
    { "student_id": "BC2023453", "name": "KAMAL KANT" },
    { "student_id": "BC2023456", "name": "VIDHI GUPTA" },
    { "student_id": "BC2023460", "name": "UNNATI SAXENA" },
    { "student_id": "BC2023461", "name": "ABHISHEK SHARMA" },
    { "student_id": "BC2023465", "name": "PIYUSH JAISWAL" },
    { "student_id": "BC2023468", "name": "SYED SAIM HUSSAIN" },
    { "student_id": "BC2023474", "name": "NITIN SAGAR" },
    { "student_id": "BC2023479", "name": "SAUMYA SINGH" },
    { "student_id": "BC2023485", "name": "VISHESH PANT" },
    { "student_id": "BC2023493", "name": "NISHANT GANGWAR" },
    { "student_id": "BC2023498", "name": "ANAMTA YUSUF" },
    { "student_id": "BC2023502", "name": "SHOURYA PATHAK" },
    { "student_id": "BC2023509", "name": "SHAGUN GANGWAR" },
    { "student_id": "BC2023512", "name": "NIMRA HIFZAN" },
    { "student_id": "BC2023517", "name": "ARYAN TIWARI" },
    { "student_id": "BC2023520", "name": "ROUNAK" },
    { "student_id": "BC2023528", "name": "BHUWANESHWARI KASHYAP" },
    { "student_id": "BC2023529", "name": "SIMRAN ARORA" },
    { "student_id": "BC2023537", "name": "AAKANKSHA" },
    { "student_id": "BC2023550", "name": "VANSH SAXENA" },
    { "student_id": "BC2023555", "name": "SHALIV ALI" },
    { "student_id": "BC2023565", "name": "VANSH AGARWAL" },
    { "student_id": "BC2023566", "name": "TAYYABA FATIMA" },
    { "student_id": "BC2023574", "name": "ADITYA PRAJAPATI" },
    { "student_id": "BC2023577", "name": "AKSHARA GUPTA" },
    { "student_id": "BC2023589", "name": "AINA GUPTA" },
    { "student_id": "BC2023591", "name": "MOHD KAIF" },
    { "student_id": "BC2023596", "name": "SHIVAM MAURYA" },
    { "student_id": "BC2023609", "name": "ARUN GANGWAR" },
    { "student_id": "BC2023618", "name": "SUMIT SAXENA" },
    { "student_id": "BC2023627", "name": "KHYATI SINGH" },
    { "student_id": "BC2023629", "name": "DHEERAJ YADAV" },
    { "student_id": "BC2023635", "name": "SHIVA MADDHESHIYA" },
    { "student_id": "BC2023642", "name": "GOVIND GUPTA" },
    { "student_id": "BC2023654", "name": "AYUSHI KOHARWAL" },
    { "student_id": "BC2023656", "name": "SACHIN KHARWAR" },
    { "student_id": "BC2023657", "name": "SHASHANK RAJPUT" },
    { "student_id": "BC2023666", "name": "SYED TANZIM WAJIH" },
    { "student_id": "BC2023684", "name": "HEMANT KUMAR BHARTI" },
    { "student_id": "BC2023685", "name": "NISHA KASHYAP" },
    { "student_id": "BC2023701", "name": "VISHAL BHOJWANI" },
    { "student_id": "BC2023075", "name": "SHIVA YADAV" },
    { "student_id": "BC2023250", "name": "RAJAN SINGH" }
  ];

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch sessions from backend
  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching sessions from server...');
      
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed');
        return;
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`✅ Loaded ${result.data.length} sessions`);
        setSessions(result.data);
      } else {
        console.error('❌ Error fetching sessions:', result.message);
      }
    } catch (error) {
      console.error('❌ Network error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for a session
  const fetchAttendance = async (sessionId) => {
    try {
      setLoading(true);
      console.log(`📋 Fetching attendance for session: ${sessionId}`);
      
      const response = await fetch(`${API_BASE_URL}/attendance/${sessionId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed');
        return;
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`✅ Loaded ${result.data.length} attendance records`);
        setAttendanceRecords(result.data);
      } else {
        console.error('❌ Error fetching attendance:', result.message);
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('❌ Network error fetching attendance:', error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Save session to backend
  const saveSessionToDB = async (sessionData) => {
    try {
      console.log('💾 Saving session to database:', sessionData);
      
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
      });

      if (response.status === 403) {
        throw new Error('Teacher access required to create sessions');
      }

      const result = await response.json();
      console.log('📥 Session save response:', result);
      return result;
    } catch (error) {
      console.error('❌ Network error saving session:', error);
      return { 
        status: 'error', 
        message: error.message || 'Network error: Could not connect to server' 
      };
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Auto-refresh attendance every 10 seconds if session is selected
    if (currentSession) {
      const interval = setInterval(() => {
        fetchAttendance(currentSession);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateQR = async () => {
    if (!formData.session.trim()) {
      alert("Please enter a session name or ID!");
      return;
    }

    const sessionId = formData.session;

    const payload = JSON.stringify({ 
      session: sessionId,
      course: formData.course,
      section: formData.section,
      time: formData.time,
      date: formData.date,
      faculty: formData.faculty,
      subject: formData.subject,
      note: formData.note,
      ts: new Date().toISOString() 
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payload)}&size=300x300`;

    setQrResult(
      <div className="text-center animate-fade-in">
        <div className="bg-gray-900 text-white p-4 rounded-t-2xl">
          <h3 className="text-xl font-bold">QR for: {sessionId}</h3>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
            {formData.course && <div>Course: {formData.course}</div>}
            {formData.section && <div>Section: {formData.section}</div>}
            {formData.subject && <div>Subject: {formData.subject}</div>}
            {formData.faculty && <div>Faculty: {formData.faculty}</div>}
          </div>
        </div>
        <div className="p-6 bg-white rounded-b-2xl">
          <img 
            src={qrUrl} 
            alt="QR Code" 
            className="mx-auto border-4 border-gray-200 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            {formData.date && (
              <div className="flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date: {formData.date}
              </div>
            )}
            {formData.time && (
              <div className="flex items-center justify-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Time: {formData.time}
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="text-gray-700 text-sm flex items-center justify-center">
              <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
              Right-click to save this QR code for later use
            </p>
          </div>
        </div>
      </div>
    );

    // Save session to MongoDB
    const sessionData = {
      sessionId: sessionId,
      course: formData.course,
      section: formData.section,
      subject: formData.subject,
      faculty: formData.faculty,
      date: formData.date,
      time: formData.time,
      note: formData.note
    };

    const result = await saveSessionToDB(sessionData);
    if (result.status === 'success') {
      setCurrentSession(sessionId);
      fetchSessions();
      fetchAttendance(sessionId);
    } else {
      alert(result.message);
    }
  };

  const isFormValid = formData.session.trim() && formData.course && formData.section && formData.time && formData.date && formData.faculty && formData.subject;

  // Get present students
  const getPresentStudents = () => {
    const presentRolls = [...new Set(attendanceRecords.map(record => record.roll))];
    return allStudents.filter(student => 
      presentRolls.includes(student.student_id)
    );
  };

  // Get absent students
  const getAbsentStudents = () => {
    const presentRolls = [...new Set(attendanceRecords.map(record => record.roll))];
    return allStudents.filter(student => 
      !presentRolls.includes(student.student_id)
    );
  };

  // Get attendance percentage
  const getAttendancePercentage = () => {
    const presentCount = getPresentStudents().length;
    const totalCount = allStudents.length;
    return totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;
  };

  const exportAttendance = async (sessionId) => {
    try {
      console.log(`📊 Exporting attendance for session: ${sessionId}`);
      
      const response = await fetch(`${API_BASE_URL}/export/${sessionId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.status === 403) {
        alert('Teacher access required to export data');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance_${sessionId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Export completed successfully');
    } catch (error) {
      console.error('❌ Error exporting attendance:', error);
      alert('Error exporting attendance data');
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session and all its attendance records?')) {
      try {
        console.log(`🗑️ Deleting session: ${sessionId}`);
        
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.status === 403) {
          alert('Access denied: Only the creator can delete this session');
          return;
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          console.log('✅ Session deleted successfully');
          fetchSessions();
          if (currentSession === sessionId) {
            setCurrentSession(null);
            setAttendanceRecords([]);
          }
        } else {
          console.error('❌ Error deleting session:', result.message);
          alert(result.message);
        }
      } catch (error) {
        console.error('❌ Network error deleting session:', error);
      }
    }
  };

  const loadSession = (sessionId) => {
    console.log(`📂 Loading session: ${sessionId}`);
    setCurrentSession(sessionId);
    fetchAttendance(sessionId);
  };

  const refreshData = () => {
    console.log('🔄 Refreshing data...');
    if (currentSession) {
      fetchAttendance(currentSession);
    }
    fetchSessions();
  };

  // Check if user is teacher
  if (user?.role !== 'teacher') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <ShieldCheckIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
        <p className="text-gray-600 mb-4">
          This section is only accessible to teachers. Please contact your administrator for access.
        </p>
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-700 text-sm">
            <strong>Current Role:</strong> {user?.role}<br />
            <strong>Required Role:</strong> Teacher
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-7xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <DocumentChartBarIcon className="w-8 h-8 text-gray-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Portal</h1>
        </div>
        <p className="text-gray-600">Generate QR codes for your class sessions and view attendance</p>
        
        {/* Debug and Refresh Buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button 
            onClick={refreshData}
            className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - QR Generation & Session Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <QrCodeIcon className="w-4 h-4 mr-2 text-gray-600" />
                  Session Name / ID *
                </label>
                <input 
                  type="text" 
                  value={formData.session}
                  onChange={(e) => handleInputChange('session', e.target.value)}
                  placeholder="e.g. CS101-Lecture-2025-01-15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course *
                </label>
                <select 
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section *
                </label>
                <select 
                  value={formData.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Slot *
                </label>
                <select 
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Faculty Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Faculty Name *
                </label>
                <input 
                  type="text" 
                  value={formData.faculty}
                  onChange={(e) => handleInputChange('faculty', e.target.value)}
                  placeholder="e.g. Dr. Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <select 
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Optional Note */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea 
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="e.g. Special instructions, room number, important announcements..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={generateQR}
            disabled={!isFormValid || loading}
            className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg shadow-lg"
          >
            {loading ? 'Processing...' : (isFormValid ? 'Generate QR Code' : 'Fill All Required Fields')}
          </button>

          {/* QR Result */}
          <div className="mt-6">
            {qrResult || (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your QR code will appear here</p>
                <p className="text-gray-400 text-sm mt-2">Fill in all the required details and click generate</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Session History & Attendance List */}
        <div className="space-y-6">
          {/* Session History */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
                Session History
              </h3>
              <button 
                onClick={fetchSessions}
                className="text-gray-600 hover:text-gray-800"
                title="Refresh sessions"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div 
                    key={session._id} 
                    className={`bg-white p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      currentSession === session.sessionId 
                        ? 'border-gray-800 bg-gray-100' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => loadSession(session.sessionId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {session.sessionId}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.sessionId);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        title="Delete session"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>{session.course}</strong> - Sec {session.section}</div>
                      <div>{session.subject}</div>
                      <div className="text-gray-700">{session.faculty}</div>
                      <div className="text-gray-500">
                        {session.date} • {session.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sessions yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first session to get started
                </p>
              </div>
            )}
          </div>

          {/* Attendance List */}
          {currentSession && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <UsersIcon className="w-6 h-6 mr-2 text-gray-600" />
                    Class Attendance
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Session: {currentSession}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full">
                    {getPresentStudents().length}/{allStudents.length}
                  </span>
                  {attendanceRecords.length > 0 && (
                    <button
                      onClick={() => exportAttendance(currentSession)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-900 transition-colors"
                      title="Export to CSV"
                    >
                      Export
                    </button>
                  )}
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-gray-800">{getPresentStudents().length}</div>
                  <div className="text-xs text-gray-600">Present</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-gray-800">{getAbsentStudents().length}</div>
                  <div className="text-xs text-gray-600">Absent</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                  <div className="text-2xl font-bold text-gray-800">{getAttendancePercentage()}%</div>
                  <div className="text-xs text-gray-600">Attendance</div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setViewMode('present')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'present' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Present ({getPresentStudents().length})
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Students ({allStudents.length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading attendance data...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {viewMode === 'present' ? (
                    // Present Students View
                    getPresentStudents().length > 0 ? (
                      getPresentStudents().map((student, index) => {
                        const attendanceRecord = attendanceRecords.find(record => record.roll === student.student_id);
                        return (
                          <div key={student.student_id} className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                                <div>
                                  <h4 className="font-semibold text-gray-800">{student.name}</h4>
                                  <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">{attendanceRecord?.scanTime}</p>
                                <p className="text-xs text-gray-600">Present</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No students have marked attendance yet</p>
                      </div>
                    )
                  ) : (
                    // All Students View
                    allStudents.map((student, index) => {
                      const isPresent = getPresentStudents().some(present => present.student_id === student.student_id);
                      const attendanceRecord = attendanceRecords.find(record => record.roll === student.student_id);
                      
                      return (
                        <div key={student.student_id} className={`bg-white p-3 rounded-lg border shadow-sm ${
                          isPresent ? 'border-gray-300' : 'border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isPresent ? (
                                <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-gray-400" />
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-800">{student.name}</h4>
                                <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isPresent ? (
                                <>
                                  <p className="text-sm text-gray-500">{attendanceRecord?.scanTime}</p>
                                  <p className="text-xs text-gray-600">Present</p>
                                </>
                              ) : (
                                <p className="text-xs text-gray-500">Absent</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Auto-refresh Notice */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-gray-700 text-sm text-center">
                  <strong>Auto-refresh enabled:</strong> List updates every 10 seconds
                </p>
              </div>
            </div>
          )}

          {/* Current Session Info */}
          {currentSession && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Session</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-medium">{currentSession}</span>
                </div>
                {formData.course && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{formData.course}</span>
                  </div>
                )}
                {formData.section && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section:</span>
                    <span className="font-medium">{formData.section}</span>
                  </div>
                )}
                {formData.subject && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">{formData.subject}</span>
                  </div>
                )}
                {formData.faculty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faculty:</span>
                    <span className="font-medium">{formData.faculty}</span>
                  </div>
                )}
                {formData.date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formData.date}</span>
                  </div>
                )}
                {formData.time && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formData.time}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;