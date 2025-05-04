import axios from "axios";

export const baseURL = "http://localhost:5000";

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

// Teacher Dashboard
export const createCourse = async (formData) => Apis.post("/api/courses/add", formData);
export const getTeacherCourses = async () => Apis.get("/api/courses/me");
export const addLesson = async (formData) => Apis.post("/api/lessons/add", formData);
export const getTeacherCourse = async (slug) => Apis.get(`/api/courses/${slug}`);
export const getLessonsByCourse = async (courseId) => Api.get(`/api/lessons/course/${courseId}`);
export const getLessonsByCourses = async (courseId) => Api.get(`/api/course/${courseId}`);

export const getLessonById = async (lessonId) => Api.get(`/api/lessons/${lessonId}`);
export const updateLesson = async (lessonId, data) => Api.patch(`/api/lessons/${lessonId}`, data);
export const deleteLessonById = async (lessonId) => Api.delete(`/api/lessons/${lessonId}`);
export const getAllCoursesWhy = async () => Api.get("/api/get");
export const getCourseBySlug  = async (slug) => Api.get(`/api/get/${slug}`);

// Assignment APIs
export const createAssignment = async (formData) => Apis.post("/api/assignments", formData);
export const getAssignmentsByLesson = async (lessonId) => Api.get(`/api/assignments/lesson/${lessonId}`);
export const submitAssignment = async (assignmentId, formData) => Apis.post(`/api/assignments/${assignmentId}/submit`, formData);
export const getAssignmentSubmissions = async (assignmentId) => Api.get(`/api/assignments/${assignmentId}/submissions`);
export const gradeAssignment = async (submissionId, gradeData) => Api.patch(`/api/assignments/submissions/${submissionId}/grade`, gradeData);
export const deleteAssignmentById = async (assignmentId) => Api.delete(`/api/assignments/${assignmentId}`);

// Quiz APIs
export const createQuiz = async (formData) => Apis.post("/api/quizzes", formData);
export const deleteQuizById = async (quizId) => Api.delete(`/api/quizzes/${quizId}`);