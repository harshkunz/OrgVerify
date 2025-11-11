import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
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
      company: "Rapid Bank",
      logo: "/awash-bank-logo.png",
      quote:
        "Integrating this system streamlined our employee recruitment verification.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">

      {/* Header Navbar*/}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/98 via-blue-50/95 to-purple-50/98 dark:from-gray-900/98 dark:via-gray-800/95 dark:to-gray-900/98 backdrop-blur-md border-b border-blue-100/50 dark:border-gray-700/50 shadow-lg shadow-blue-100/20 dark:shadow-gray-900/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-18 py-2">
            <Navbar />
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="group relative p-2.5 ml-4 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-blue-200/50 dark:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <FiMoon className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                )}
                <span className="absolute top-16 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden group relative p-2.5 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-blue-200/50 dark:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                aria-label="Toggle"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-5 h-5 text-red-700 dark:text-red-400 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <FiMenu className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 px-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col space-y-2 mx-24 text-center text-sm">
                <Link
                  to="/"
                  className="text-gray-800 border border-blue-500 rounded-3xl py-2 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/"
                  className="text-gray-800 border border-blue-500 rounded-3xl py-2  dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/"
                  className="text-gray-800 border border-blue-500 rounded-3xl py-2 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/admin/login"
                  className="py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md text-center "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
                <Link
                  to="/login"
                  className="py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-md text-center "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  User
                </Link>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-36 px-4 overflow-hidden bg-gradient-to-br from-blue-200 via-white to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl mb-5 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-normal">
              Organization Verification Platform
            </h1>
            <p className="text-md md:text-md text-gray-700 mx-10 dark:text-gray-300 mb-8 leading-relaxed">
              Secure digital platform for managing organizations, employees, and
              credentials. Trusted by companies nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center font-semibld text-sm">
              <Link
                to="/admin/login"
                className="inline-flex px-6 py-3 items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Works Now
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex px-6 py-3 items-center justify-center bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-400 rounded-3xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-12 px-12 bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
            Integrated Features
          </h2>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Boosting process reliability with minimal errors.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-center items-center md:gap-0 gap-6 mt-12 mb-4">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 md:-mr-2 rotate-[-8deg] w-72 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-800"
          >
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2076/2076169.png"
                alt="User Chat"
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Client Chat
            </h3>
            <p className="text-gray-600 text-xs dark:text-gray-400 text-center mb-2">
              Secure messaging for direct and verified communication.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
            animate={{ y: [-5, 0, -5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 md:-mr-2 rotate-[6deg] w-72 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-green-200 dark:border-green-800"
          >
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/942/942748.png"
                alt="Data Protection"
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Data Protected
            </h3>
            <p className="text-gray-600 text-xs dark:text-gray-400 text-center mb-2">
              Advanced encryption ensures total data safety.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-30 md:-mr-2 rotate-[-5deg] w-72 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-purple-200 dark:border-purple-800"
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4471/4471189.png"
                alt="Unique ID"
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Unique Org ID
            </h3>
            <p className="text-gray-600 text-xs dark:text-gray-400 text-center mb-2">
              Every verified org gets a globally unique digital ID.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
            animate={{ y: [-8, 0, -8] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-40 md:rotate-[8deg] w-72 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-orange-800"
          >
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4208/4208450.png"
                alt="UI"
                className="w-8 h-8"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Easy to Use
            </h3>
            <p className="text-gray-600 text-xs dark:text-gray-400 text-center mb-2">
              Beautiful, minimal interface built for all users.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 px-8 dark:bg-gray-800 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              Reviews
            </h2>
            <p className="text-md text-gray-500 dark:text-gray-400">
              See what our partners say about us
            </p>
          </div>

          <div className="relative bg-blue-50 dark:bg-gray-900 rounded-2xl shadow-xl p-8 mx-8 md:p-12">
            <FaQuoteLeft className="text-purple-600 dark:text-blue-400 w-12 h-12 mb-6 opacity-50" />
            <p className="text-md md:text-xl text-gray-800 dark:text-gray-300 mb-6 italic">
              {testimonials[currentTestimonial].quote}
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              — {testimonials[currentTestimonial].company}
            </p>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial
                      ? "bg-purple-600 dark:bg-blue-400 w-8"
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
      <footer className="bg-gray-700 dark:bg-gray-950 text-white py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 mb-8">
            {/* About */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg mb-3 text-white">OrgVerify Platform</h3>
              <ul className="space-y-1">
                <li className="flex items-center justify-center text-xs text-gray-300 hover:text-purple-500">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@xyz.com" className="hover:text-purple-500 transition-colors">
                    support@xyz.com
                  </a>
                </li>
                <li className="flex items-center justify-center text-xs text-gray-300 hover:text-purple-500">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91 XX XXX XXXX</span>
                </li>
                <li className="flex items-center justify-center text-xs text-gray-300 hover:text-purple-500">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Delhi, India</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg mb-2 text-white">Links</h3>
              <ul className="space-y-0 text-center">
                <li>
                  <Link
                    to="/"
                    className="text-xs text-gray-300 hover:text-purple-500 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-xs text-gray-300 hover:text-purple-500 transition-colors"
                  >
                    Verify Credentials
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-xs text-gray-300 hover:text-purple-500 transition-colors"
                  >
                    Work with Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg mb-3 text-white">Connect Us</h3>
              <div className="flex space-x-3 justify-center">
                <a
                  href="https://facebook.com/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook size={22} />
                </a>
                <a
                  href="https://twitter.com/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={22} />
                </a>
                <a
                  href="https://linkedin.com/company/orgverify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={22} />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-500 pt-2  text-center">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} OrgVerify.
            </p>
          </div>
        </div>
      </footer>




    </div>
  );
};

export default LandingPage;
