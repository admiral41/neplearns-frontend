/**
 * Services Barrel Export
 * Import all services from a single location
 *
 * Usage:
 * import { authService, courseService } from '@/lib/services';
 *
 * Or:
 * import authService from '@/lib/services/auth.service';
 */

export { default as authService } from './auth.service';
export { default as courseService } from './course.service';
export { default as studentService } from './student.service';
export { default as instructorService } from './instructor.service';
export { default as adminService } from './admin.service';
export { default as liveClassService } from './liveClass.service';
export { default as assignmentService } from './assignment.service';
export { default as announcementService } from './announcement.service';
export { default as inquiryService } from './inquiry.service';

// Re-export API client and error handlers for convenience
export { default as apiClient } from '../api/client';
export * from '../api/errors';
