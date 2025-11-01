import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaQuoteLeft,
} from "react-icons/fa";
import FAQSection from "../user/FAQSection";

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Auto-scrolling testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    {
      id: 1,
      company: "Ethio Telecom",
      logo: "/ethio-telecom-logo.png",
      quote:
        "Organization verification system saved us 60% time in employee credential checks.",
    },
    {
      id: 2,
      company: "Commercial Bank of Ethiopia",
      logo: "/cbe-logo.png",
      quote:
        "Highly reliable for document authentication. A game-changer for HR processes.",
    },
    {
      id: 3,
      company: "Awash Bank",
      logo: "/awash-bank-logo.png",
      quote:
        "Integrating this system streamlined our employee recruitment verification.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header/Navbar - Enhanced with Beautiful Styling */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/98 via-blue-50/95 to-purple-50/98 dark:from-gray-900/98 dark:via-gray-800/95 dark:to-gray-900/98 backdrop-blur-md border-b border-blue-100/50 dark:border-gray-700/50 shadow-lg shadow-blue-100/20 dark:shadow-gray-900/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-2">
            {/* Navbar Component */}
            <Navbar />

            {/* Right Side Controls Container */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle - Enhanced */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-blue-200/50 dark:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <FiMoon className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                )}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              {/* Mobile Menu Button - Enhanced */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden group relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-blue-200/50 dark:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6 text-red-600 dark:text-red-400 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <FiMenu className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/admin-login"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Organization Verification System
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Secure digital platform for managing organizations, employees, and
              credentials. Trusted by companies nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Verify Now
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all font-semibold text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Simple steps to verify organizational credentials
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Register
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create an account or login to access the verification system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Submit Details
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Register your company and manage employees with ease.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our system provides secure verification and management.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  4
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Get Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive a digitally signed report within seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Organizations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              See what our partners say about us
            </p>
          </div>

          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
            <FaQuoteLeft className="text-blue-600 dark:text-blue-400 w-12 h-12 mb-6 opacity-50" />
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 italic">
              {testimonials[currentTestimonial].quote}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              — {testimonials[currentTestimonial].company}
            </p>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? "bg-blue-600 dark:bg-blue-400 w-8"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-4">OrgVerify Platform</h3>
              <p className="text-gray-300 mb-4">
                Secure organization verification and employee management system.
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Email: support@orgverify.com
              </p>
              <p className="text-sm text-gray-400">Phone: +251 XX XXX XXXX</p>
              <p className="text-sm text-gray-400 mt-2">
                Addis Ababa, Ethiopia
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    Verify Credentials
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    About Platform
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FaFacebook size={24} />
                </a>
                <a
                  href="https://twitter.com/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FaTwitter size={24} />
                </a>
                <a
                  href="https://linkedin.com/company/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} OrgVerify Platform. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;