/**
 * Get progress bar color class based on percentage
 * @param {number} progress - Progress percentage (0-100)
 * @returns {string} - Tailwind color class
 */
export const getProgressColor = (progress) => {
  if (progress < 40) return "bg-destructive"; // Red for low progress (0-39%)
  if (progress < 70) return "bg-warning"; // Yellow for medium progress (40-69%)
  return "bg-success"; // Green for high progress (70-100%)
};

/**
 * Get progress bar background color class based on percentage
 * @param {number} progress - Progress percentage (0-100)
 * @returns {string} - Tailwind background color class with opacity
 */
export const getProgressBgColor = (progress) => {
  if (progress < 40) return "bg-destructive/20"; // Light red background
  if (progress < 70) return "bg-warning/20"; // Light yellow background
  return "bg-success/20"; // Light green background
};
