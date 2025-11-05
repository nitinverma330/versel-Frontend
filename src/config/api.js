// qr-attendance/src/config/api.js
const API_BASE_URL = 'https://versel-backend-henna.vercel.app';

console.log('🔗 API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  
  // Attendance
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ATTENDANCE_BY_SESSION: (session) => `${API_BASE_URL}/api/attendance/${session}`,
  ALL_ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  
  // Sessions
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  CREATE_SESSION: `${API_BASE_URL}/api/sessions`,
  DELETE_SESSION: (sessionId) => `${API_BASE_URL}/api/sessions/${sessionId}`,
  
  // Students
  STUDENTS: `${API_BASE_URL}/api/students`,
  STUDENT_BY_ID: (id) => `${API_BASE_URL}/api/students/${id}`,
  STUDENT_STATS: (rollNumber) => `${API_BASE_URL}/api/student-stats/${rollNumber}`,
  
  // Export
  EXPORT: (session) => `${API_BASE_URL}/api/export/${session}`,
  
  // Test
  TEST: `${API_BASE_URL}/api/test`,
  HEALTH: `${API_BASE_URL}/api/health`,
  CONNECTION_TEST: `${API_BASE_URL}/api/connection-test`
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = typeof endpoint === 'function' ? endpoint() : endpoint;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`🔄 API Call: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    console.log(`✅ API Success: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
};

// Specific API functions
export const loginUser = (credentials) => 
  apiCall(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

export const registerUser = (userData) =>
  apiCall(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const getProfile = () => 
  apiCall(API_ENDPOINTS.PROFILE);

export const updateProfile = (profileData) =>
  apiCall(API_ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });

export const markAttendance = (attendanceData) =>
  apiCall(API_ENDPOINTS.ATTENDANCE, {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  });

export const getSessions = () => 
  apiCall(API_ENDPOINTS.SESSIONS);

export const createSession = (sessionData) =>
  apiCall(API_ENDPOINTS.CREATE_SESSION, {
    method: 'POST',
    body: JSON.stringify(sessionData)
  });

export const deleteSession = (sessionId) =>
  apiCall(API_ENDPOINTS.DELETE_SESSION(sessionId), {
    method: 'DELETE'
  });

export const getAttendanceBySession = (sessionId) =>
  apiCall(API_ENDPOINTS.ATTENDANCE_BY_SESSION(sessionId));

export const getAllAttendance = () =>
  apiCall(API_ENDPOINTS.ALL_ATTENDANCE);

export const getAllStudents = () =>
  apiCall(API_ENDPOINTS.STUDENTS);

export const getStudentStats = (rollNumber) =>
  apiCall(API_ENDPOINTS.STUDENT_STATS(rollNumber));

export const exportAttendance = (sessionId) =>
  apiCall(API_ENDPOINTS.EXPORT(sessionId));

export const testBackendConnection = () => 
  apiCall(API_ENDPOINTS.CONNECTION_TEST);

export const healthCheck = () => 
  apiCall(API_ENDPOINTS.HEALTH);