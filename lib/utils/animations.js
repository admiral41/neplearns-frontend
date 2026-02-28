// Animation utility classes
export const fadeInUp = "opacity-0 translate-y-10 transition-all duration-700 ease-out";
export const fadeInUpVisible = "opacity-100 translate-y-0";

export const fadeIn = "opacity-0 transition-opacity duration-700 ease-out";
export const fadeInVisible = "opacity-100";

export const scaleIn = "opacity-0 scale-90 transition-all duration-700 ease-out";
export const scaleInVisible = "opacity-100 scale-100";

// Smooth scroll function
export const smoothScroll = (targetId) => {
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
