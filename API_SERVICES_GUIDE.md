# API Services Architecture Guide

Complete guide for using the production-grade API services layer in PadhaiHub.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Usage Examples](#usage-examples)
5. [Available Services](#available-services)
6. [React Query Hooks](#react-query-hooks)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Overview

This project uses a **production-grade API architecture** with the following features:

- **Axios-based HTTP client** with interceptors
- **Automatic token management** (JWT with refresh token flow)
- **Centralized error handling** with custom error classes
- **Service layer pattern** for organized API calls
- **React Query integration** for caching, synchronization, and optimistic updates
- **TypeScript-ready** (can be migrated easily)

---

## Architecture

```
lib/
├── api/
│   ├── client.js           # Axios instance with interceptors
│   └── errors.js           # Custom error classes & handlers
├── services/
│   ├── auth.service.js     # Authentication APIs
│   ├── course.service.js   # Course management APIs
│   ├── student.service.js  # Student profile & dashboard APIs
│   ├── liveClass.service.js # Live classes APIs
│   ├── assignment.service.js # Assignment APIs
│   ├── announcement.service.js # Announcements APIs
│   ├── inquiry.service.js  # Contact/inquiry APIs
│   └── index.js            # Barrel export
├── hooks/
│   ├── useAuth.js          # Auth hooks (login, register, logout)
│   ├── useCourses.js       # Course hooks
│   ├── useStudent.js       # Student hooks
│   ├── useAssignments.js   # Assignment hooks
│   ├── useAnnouncements.js # Announcement hooks
│   └── useLiveClasses.js   # Live class hooks
└── providers/
    └── QueryProvider.jsx   # React Query provider
```

---

## Setup

### 1. Environment Variables

Update your `.env.local` file:

```bash
# Required: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Dependencies Installed

The following packages are already installed:

```json
{
  "axios": "^1.x",
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x"
}
```

### 3. Provider Setup

The `QueryProvider` is already integrated in `app/layout.js`.

---

## Usage Examples

### Method 1: Using React Query Hooks (Recommended)

```jsx
'use client';

import { useLogin, useUser } from '@/lib/hooks/useAuth';
import { useCourses } from '@/lib/hooks/useCourses';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const loginMutation = useLogin();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await loginMutation.mutateAsync({
      phone: formData.get('phone'),
      password: formData.get('password'),
      rememberMe: formData.get('remember') === 'on',
    });
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="phone" required />
      <input name="password" type="password" required />
      <input name="remember" type="checkbox" />

      <Button
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>

      {loginMutation.isError && (
        <p className="text-red-500">{loginMutation.error.message}</p>
      )}
    </form>
  );
}
```

### Method 2: Using Services Directly

```jsx
'use client';

import { authService, courseService } from '@/lib/services';
import { toast } from 'sonner';

export default function DirectAPIExample() {
  const handleEnroll = async (courseId) => {
    try {
      const result = await courseService.enrollInCourse(courseId);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button onClick={() => handleEnroll('course-123')}>
      Enroll Now
    </button>
  );
}
```

---

## Available Services

### 1. Authentication Service (`authService`)

```javascript
import { authService } from '@/lib/services';

// Login
await authService.login(phone, password, rememberMe);

// Register student
await authService.registerStudent(studentData);

// Apply as instructor
await authService.applyAsInstructor(formData);

// Logout
await authService.logout();

// Forgot password
await authService.forgotPassword(phone);

// Reset password
await authService.resetPassword(phone, otp, newPassword);

// Get current user
await authService.getCurrentUser();

// Check if authenticated
authService.isAuthenticated();

// Get stored user
const user = authService.getUser();
```

### 2. Course Service (`courseService`)

```javascript
import { courseService } from '@/lib/services';

// Get all courses
await courseService.getCourses({ category: 'science', level: 'see' });

// Get featured courses
await courseService.getFeaturedCourses(6);

// Get course by ID
await courseService.getCourseById(courseId);

// Get course curriculum
await courseService.getCourseCurriculum(courseId);

// Enroll in course
await courseService.enrollInCourse(courseId, enrollmentData);

// Get enrolled courses
await courseService.getEnrolledCourses({ status: 'active' });

// Get course progress
await courseService.getCourseProgress(courseId);

// Mark lesson completed
await courseService.markLessonCompleted(lessonId);

// Submit quiz
await courseService.submitQuiz(quizId, answers);

// Add review
await courseService.addCourseReview(courseId, rating, comment);

// Search courses
await courseService.searchCourses('physics', { level: 'see' });
```

### 3. Student Service (`studentService`)

```javascript
import { studentService } from '@/lib/services';

// Get dashboard data
await studentService.getDashboard();

// Get profile
await studentService.getProfile();

// Update profile
await studentService.updateProfile(profileData);

// Update profile picture
await studentService.updateProfilePicture(file);

// Get progress
await studentService.getProgress();

// Get study hours
await studentService.getStudyHours('week');

// Get statistics
await studentService.getStats();

// Get payment history
await studentService.getPaymentHistory();

// Update settings
await studentService.updateSettings(settings);

// Change password
await studentService.changePassword(currentPassword, newPassword);

// Get certificates
await studentService.getCertificates();

// Get notifications
await studentService.getNotifications({ read: false });
```

### 4. Live Class Service (`liveClassService`)

```javascript
import { liveClassService } from '@/lib/services';

// Get upcoming classes
await liveClassService.getUpcomingClasses();

// Join live class
await liveClassService.joinLiveClass(classId);

// Get recorded classes
await liveClassService.getRecordedClasses();

// Get class schedule
await liveClassService.getClassSchedule('2025-01');

// Mark attendance
await liveClassService.markAttendance(classId);
```

### 5. Assignment Service (`assignmentService`)

```javascript
import { assignmentService } from '@/lib/services';

// Get assignments
await assignmentService.getAssignments({ status: 'pending' });

// Get assignment by ID
await assignmentService.getAssignmentById(assignmentId);

// Submit assignment
await assignmentService.submitAssignment(assignmentId, formData);

// Update submission
await assignmentService.updateSubmission(assignmentId, formData);

// Get upcoming assignments
await assignmentService.getUpcomingAssignments(5);
```

### 6. Announcement Service (`announcementService`)

```javascript
import { announcementService } from '@/lib/services';

// Get announcements
await announcementService.getAnnouncements({ type: 'urgent' });

// Get recent announcements
await announcementService.getRecentAnnouncements(5);

// Mark as read
await announcementService.markAsRead(announcementId);

// Get unread count
await announcementService.getUnreadCount();
```

### 7. Inquiry Service (`inquiryService`)

```javascript
import { inquiryService } from '@/lib/services';

// Submit inquiry
await inquiryService.submitInquiry(inquiryData);

// Request callback
await inquiryService.requestCallback({ name, phone, preferred_time });

// Subscribe to newsletter
await inquiryService.subscribeNewsletter(email);

// Submit feedback
await inquiryService.submitFeedback(feedbackData);
```

---

## React Query Hooks

### Authentication Hooks

```javascript
import {
  useUser,
  useLogin,
  useRegisterStudent,
  useLogout
} from '@/lib/hooks/useAuth';

function Component() {
  const { data: user, isLoading, error } = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegisterStudent();
  const logoutMutation = useLogout();

  // Usage
  loginMutation.mutate({ phone, password, rememberMe });
  registerMutation.mutate(studentData);
  logoutMutation.mutate();
}
```

### Course Hooks

```javascript
import {
  useCourses,
  useFeaturedCourses,
  useEnrolledCourses,
  useEnrollCourse
} from '@/lib/hooks/useCourses';

function CoursesPage() {
  const { data: courses, isLoading } = useCourses({ level: 'see' });
  const { data: featured } = useFeaturedCourses(6);
  const enrollMutation = useEnrollCourse();

  const handleEnroll = (courseId) => {
    enrollMutation.mutate({ courseId, enrollmentData: {} });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {courses.courses.map(course => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <button onClick={() => handleEnroll(course.id)}>
            Enroll
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Student Dashboard Hook

```javascript
import { useDashboard } from '@/lib/hooks/useStudent';

function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Welcome, {data.user.name}!</h1>
      <div>Total Courses: {data.stats.totalCourses}</div>
      <div>Study Hours: {data.stats.studyHours}</div>
    </div>
  );
}
```

---

## Error Handling

### Custom Error Classes

```javascript
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  handleApiError
} from '@/lib/services';

// Handling errors manually
try {
  await authService.login(phone, password);
} catch (error) {
  const apiError = handleApiError(error);

  if (apiError instanceof ValidationError) {
    console.log('Validation errors:', apiError.errors);
  } else if (apiError instanceof AuthenticationError) {
    console.log('Auth failed:', apiError.message);
  } else {
    console.log('General error:', apiError.message);
  }
}
```

### Global Error Handling

Errors are automatically handled by:
1. **Axios interceptors** - Auto-retry, token refresh, logging
2. **React Query hooks** - Automatic error propagation
3. **Toast notifications** - User-friendly error messages

---

## Best Practices

### 1. Use React Query Hooks

```javascript
// Good
const { data, isLoading } = useCourses();

// Avoid (unless you need fine control)
const [courses, setCourses] = useState([]);
useEffect(() => {
  courseService.getCourses().then(setCourses);
}, []);
```

### 2. Handle Loading States

```javascript
function Component() {
  const { data, isLoading, error } = useCourses();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <CourseList courses={data.courses} />;
}
```

### 3. Optimistic Updates

```javascript
const enrollMutation = useEnrollCourse();

const handleEnroll = () => {
  enrollMutation.mutate(
    { courseId, enrollmentData },
    {
      // Optimistic update
      onMutate: async () => {
        // Update UI immediately
        queryClient.setQueryData(['courses'], (old) => ({
          ...old,
          enrolled: true
        }));
      },
      // Rollback on error
      onError: (err, variables, context) => {
        queryClient.setQueryData(['courses'], context.previousData);
      }
    }
  );
};
```

### 4. Pagination & Infinite Scroll

```javascript
import { useInfiniteQuery } from '@tanstack/react-query';
import { courseService } from '@/lib/services';

function CourseList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['courses'],
    queryFn: ({ pageParam = 1 }) =>
      courseService.getCourses({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div>
      {data.pages.map(page =>
        page.courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))
      )}
      {hasNextPage && (
        <button onClick={fetchNextPage}>Load More</button>
      )}
    </div>
  );
}
```

### 5. File Uploads

```javascript
import { assignmentService } from '@/lib/services';

function AssignmentSubmit() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('assignment_file', fileInput.files[0]);
    formData.append('answer', textAnswer);

    await assignmentService.submitAssignment(assignmentId, formData);
  };
}
```

---

## API Response Structure

All API responses follow this structure (you should coordinate with backend):

```javascript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "message": "Error message",
  "errors": { // For validation errors
    "field_name": "Error message"
  }
}

// Paginated response
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "limit": 10
}
```

---

## Development Tips

### React Query DevTools

In development, you can see all queries and their states:
- Open the React Query DevTools (bottom-right corner)
- Inspect cache data, refetch queries, and debug

### Testing API Calls

```javascript
// In browser console or test file
import { authService } from '@/lib/services';

// Test login
await authService.login('1234567890', 'password123');

// Check stored token
console.log(authService.getAccessToken());
```

### Mock API During Development

If backend is not ready, you can temporarily mock responses:

```javascript
// lib/api/client.js (temporary)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.response.use((response) => {
    // Return mock data for specific endpoints
    if (response.config.url === '/courses') {
      return { courses: mockCourses, total: 10 };
    }
    return response;
  });
}
```

---

## Migration Guide

### From Mock Data to Real API

Replace static data with API calls:

```javascript
// Before (with mock data)
import { mockCourses } from '@/lib/constants/data';

function Courses() {
  return mockCourses.map(course => <CourseCard course={course} />);
}

// After (with real API)
import { useFeaturedCourses } from '@/lib/hooks/useCourses';

function Courses() {
  const { data, isLoading } = useFeaturedCourses();

  if (isLoading) return <Skeleton />;

  return data.map(course => <CourseCard course={course} />);
}
```

---

## Support

For questions or issues with the API services layer:
1. Check this documentation
2. Review the service files in `lib/services/`
3. Inspect React Query DevTools
4. Check browser network tab for API errors

---

## Next Steps

1. Coordinate API response formats with backend team
2. Update service methods to match actual backend endpoints
3. Add authentication guards to protected pages
4. Implement payment gateway integration
5. Add WebSocket for real-time features (chat, notifications)

---

**Built with modern best practices for scalable, maintainable API architecture.**
