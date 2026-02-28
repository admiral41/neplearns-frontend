"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/constants/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/providers/AuthProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace("#", ""));
    const observers = [];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(`#${id}`);
            }
          });
        }, observerOptions);

        observer.observe(element);
        observers.push(observer);
      }
    });

    const handleScrollTop = () => {
      if (window.scrollY < 100) {
        setActiveSection("#home");
      }
    };

    window.addEventListener("scroll", handleScrollTop);

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, []);

  const scrollToSection = (href) => {
    setIsOpen(false);
    setActiveSection(href);

    if (!isHomePage) {
      router.push(`/${href}`);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Text */}
          <Link
            href="/"
            className={cn(
              "text-xl font-medium tracking-wide transition-colors",
              isScrolled ? "text-slate-800" : "text-white"
            )}
          >
            NepLearns
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = isHomePage
                ? activeSection === link.href
                : link.href === "#courses" && pathname.startsWith("/courses");

              return (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={cn(
                    "text-sm transition-colors",
                    isScrolled
                      ? isActive
                        ? "text-slate-800 font-medium"
                        : "text-slate-500 hover:text-slate-800"
                      : isActive
                        ? "text-white font-medium"
                        : "text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm",
                    isScrolled ? "text-slate-600" : "text-white/80"
                  )}
                >
                  {user.firstname}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className={cn(
                    "text-sm",
                    isScrolled
                      ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "border-white/30 text-white hover:bg-white/10"
                  )}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-sm",
                      isScrolled
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "border-white/30 text-white hover:bg-white/10"
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/student-registration">
                  <Button
                    size="sm"
                    className={cn(
                      "text-sm",
                      isScrolled
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-white text-slate-800 hover:bg-white/90"
                    )}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden p-1.5 rounded transition-colors",
              isScrolled ? "hover:bg-slate-100" : "hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={cn("h-5 w-5", isScrolled ? "text-slate-600" : "text-white")} />
            ) : (
              <Menu className={cn("h-5 w-5", isScrolled ? "text-slate-600" : "text-white")} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className={cn(
              "md:hidden py-4 border-t",
              isScrolled
                ? "bg-white"
                : "bg-white/10 backdrop-blur-md border-white/20"
            )}
          >
            <div className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = isHomePage
                  ? activeSection === link.href
                  : link.href === "#courses" && pathname.startsWith("/courses");

                return (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className={cn(
                      "px-4 py-2.5 text-left text-sm transition-colors",
                      isScrolled
                        ? isActive
                          ? "bg-slate-50 text-slate-800 font-medium"
                          : "text-slate-500 hover:bg-slate-50"
                        : isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/70 hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </button>
                );
              })}

              {/* Mobile Auth */}
              <div className={cn(
                "mt-2 px-4 pt-4 border-t flex flex-col gap-2",
                isScrolled ? "border-slate-200" : "border-white/20"
              )}>
                {isAuthenticated && user ? (
                  <>
                    <span
                      className={cn(
                        "px-2 py-2 text-sm",
                        isScrolled ? "text-slate-600" : "text-white/80"
                      )}
                    >
                      Signed in as {user.firstname}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className={cn(
                        "w-full justify-center",
                        isScrolled
                          ? "border-slate-200 text-slate-600"
                          : "border-white/30 text-white hover:bg-white/10"
                      )}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-center",
                          isScrolled
                            ? "border-slate-200 text-slate-600"
                            : "border-white/30 text-white hover:bg-white/10"
                        )}
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/student-registration" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className={cn(
                          "w-full justify-center",
                          isScrolled
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-800"
                        )}
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}