import axios from "axios";

// export const baseURL = "http://localhost:5000";
export const baseURL = "https://api.neplearns.com";

// Create a base axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptors to ALL instances
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

// Create specialized instances
export const Api = api.create({
  headers: {
    "Content-Type": "application/json",
  }
});

export const Apis = api.create({
  headers: {
    "Content-Type": "multipart/form-data",
  }
});

// Add interceptors to both instances
addAuthInterceptor(Api);
addAuthInterceptor(Apis);

// Auth API
export const loginUser = async (data) => Api.post("/api/auth/login", data);
export const registerStudent = async (data) => Api.post("/api/auth/register/student", data);
export const registerTeacher = async (data) => Api.post("/api/auth/register/teacher", data);
export const getStudents = async (page = 1, limit = 10) => Api.get(`/api/auth/students?page=${page}&limit=${limit}`);
export const getTeachers = async (page = 1, limit = 10) => Api.get(`/api/auth/teachers?page=${page}&limit=${limit}`);
export const approveTeacher = async (teacherId) => Api.post(`/api/auth/approve-teacher/${teacherId}`, {});
export const getStats = async () => Api.get('/api/auth/stats');
export const forgotPassword = async (data) => {
  return Api.post("/api/auth/forgotpassword", data);
}
// Add this to your existing auth API exports
export const resetPassword = async (token, password) => {
  return Api.put(`/api/auth/resetpassword/${token}`, { password });
};
// Teacher Dashboard
export const createCourse = async (formData) => Apis.post("/api/courses/add", formData);
export const getTeacherCourses = async () => Apis.get("/api/courses/me");
export const addLesson = async (formData) => Api.post("/api/lessons/add", formData);
export const getTeacherCourse = async (slug) => Apis.get(`/api/courses/${slug}`);
export const getLessonsByCourse = async (courseId) => Api.get(`/api/lessons/course/${courseId}`);
export const getLessonsByCourses = async (courseId) => Api.get(`/api/course/${courseId}`);

export const getLessonById = async (lessonId) => Api.get(`/api/lessons/${lessonId}`);
export const updateLesson = async (lessonId, data) => Api.patch(`/api/lessons/${lessonId}`, data);
export const deleteLessonById = async (lessonId) => Api.delete(`/api/lessons/${lessonId}`);
export const getAllCoursesWhy = async () => Api.get("/api/get");
export const getCourseBySlug = async (slug) => Api.get(`/api/get/${slug}`);
export const getQuizzesByCourse = async (courseId) => Api.get(`/api/courses/${courseId}/quizzes`);
export const getAssignmentsByCourse = async (courseId) => Api.get(`/api/courses/${courseId}/assignments`);
// Quiz API functions

export const getQuizById = async (quizId) => {
  const response = await Api.get(`/api/quizzes/${quizId}`);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await Api.put(`/api/courses/quizzes/${quizId}`, quizData);
  return response.data;
};


export const getQuizResults = async (quizId) => {
  const response = await Api.get(`/api/courses/quizzes/${quizId}/results`);
  return response.data;
};

export const getQuizSubmission = async (submissionId, quizId) => {
  const response = await Api.get(`/api/courses/quizzes/${quizId}/results/${submissionId}`);
  return response.data;
};
// Add these to your existing auth API exports in api.js
export const updateCourse = async (courseId, formData) => Apis.patch(`/api/courses/${courseId}`, formData);
export const deleteCourse = async (courseId) => Api.delete(`/api/courses/${courseId}`);

// Assignment APIs
export const createAssignment = async (lessonId, assignmentData) => Api.post(`/api/courses/lessons/${lessonId}/assignments`, assignmentData);
export const getAssignmentsByLesson = async (lessonId) => Api.get(`/api/assignments/lesson/${lessonId}`);
export const submitAssignment = async (assignmentId, formData) => Apis.post(`/api/assignments/${assignmentId}/submit`, formData);
export const getAssignmentSubmissions = async (assignmentId) => Api.get(`/api/assignments/${assignmentId}/submissions`);
export const deleteAssignmentById = async (assignmentId) => Api.delete(`/api/assignments/${assignmentId}`);

export const updateAssignment = async (assignmentId, assignmentData) => {
  const response = await Api.patch(`/api/courses/assignments/${assignmentId}`, assignmentData);
  return response.data;
}
export const getAssignmentWithSubmissions = async (assignmentId) => {
  const response = await Api.get(`/api/courses/assignments/${assignmentId}`);
  return response.data;
}
// In api.js
export const gradeAssignment = async (assignmentId, submissionId, gradeData) => {
  const response = await Api.patch(
    `/api/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    gradeData
  );
  return response.data;
}
// Quiz APIs
export const createQuiz = async (formData) => Api.post(`/api/courses/quizzes`, formData);
export const deleteQuizById = async (quizId) => Api.delete(`/api/quizzes/${quizId}`);
export const enrollInCourse = async (courseId) => Api.post(`/api/students/courses/${courseId}/apply`);

// Teacher Enrollment APis
export const getEnrollmentRequests = async () => Api.get("/api/courses/enrollment-requests");
export const processEnrollmentRequest = async (requestId, action) => Api.patch(`/api/courses/enrollment-requests/${requestId}`, { action });
export const getEnrolledStudents = async () => Api.get("/api/courses/enrolled-students");


// Student Dashboard
export const getMyCourses = async () => Api.get("/api/students/courses/my-courses");
export const getStudentProfile = async () => Api.get("/api/auth/profile");


// Quiz APIs
export const takeQuiz = async (quizId) => Api.get(`/api/students/quizzes/${quizId}`);
export const submitQuiz = async (quizId, answers) => {
  return Api.post(`/api/students/quizzes/${quizId}/submit`, {
    answers: answers
  });
}; export const getQuizResult = async (quizId) => Api.get(`/api/students/quizzes/${quizId}/results`);
export const getQuizzesByLesson = async (lessonId) => Api.get(`/api/students/lessons/${lessonId}/quizzes`);
// api/apis.js
export const getQuizPreview = (quizId) => {
  return Api.get(`/api/courses/quizzes/${quizId}/preview`);
};