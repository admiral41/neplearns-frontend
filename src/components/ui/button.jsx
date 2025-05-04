import React from "react";

export const Button = ({ children, onClick, variant = "default" }) => {
  const base = "px-4 py-2 rounded-md font-medium transition";
  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border border-black text-black hover:bg-black hover:text-white",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
};
