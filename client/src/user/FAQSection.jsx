import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiRefreshCw, FiMail, FiHelpCircle } from 'react-icons/fi';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(6);

  const faqs = [
    {
      question: 'Is the verification system secure?',
      answer: 'Yes, it uses encryption, role-based access, CAPTCHA protection, and is integrated with Organization ID verification for enhanced security.',
      tags: ['security', 'safety', 'authentication']
    },
    {
      question: 'How do I verify an employee\'s credentials?',
      answer: 'Enter the Organization ID or employee details in the verification portal. The system will instantly validate it against the registered organization\'s records.',
      tags: ['verify', 'employee', 'process']
    },
    {
      question: 'What can I manage in the system?',
      answer: 'You can register companies, manage employees, track attendance, performance ratings, and verify credentials using Organization IDs.',
      tags: ['management', 'features', 'capabilities']
    },
    {
      question: 'Is there a limit to how many verifications I can do?',
      answer: 'No, but bulk verification requires special access. Contact support for enterprise plans.',
      tags: ['limit', 'bulk', 'multiple']
    },
    {
      question: 'Why does a credential show as invalid?',
      answer: 'This could mean: 1) The credential is forged, 2) It\'s not yet issued, or 3) There\'s a system error. Contact support@orgverify.com for clarification.',
      tags: ['invalid', 'error', 'troubleshoot']
    },
    {
      question: 'Can I verify credentials from other platforms?',
      answer: 'No, this system only verifies credentials registered within the OrgVerify platform.',
      tags: ['external', 'integration']
    },
    {
      question: 'How long are verification reports valid?',
      answer: 'Reports are valid indefinitely but reflect the database status at verification time. Re-verify for current status.',
      tags: ['validity', 'expiry', 'report']
    },
    {
      question: 'Can I track my previous verification attempts?',
      answer: 'Yes, authenticated users can view their complete verification history in the dashboard.',
      tags: ['tracking', 'history', 'audit']
    },
    {
      question: 'How does the system prevent fraud?',
      answer: 'All organization and employee data is securely stored with encryption, and credentials are cross-checked with the Organization ID system. Any discrepancies are flagged immediately.',
      tags: ['fake', 'forgery', 'protection']
    },
    {
      question: 'What technologies does the system use?',
      answer: 'The system is built on the MERN stack (MongoDB, Express.js, React, Node.js) and integrates PDF generation, email verification, and CAPTCHA.',
      tags: ['technology', 'tech stack', 'framework']
    },
    {
      question: 'How do I request bulk access or API integration?',
      answer: 'Please contact support with your organization\'s details and verification needs. We\'ll guide you through API access and integration.',
      tags: ['bulk', 'api', 'integration']
    },
    {
      question: 'What should I do if I suspect forged credentials?',
      answer: 'Report immediately to support@orgverify.com with details. Our team will investigate immediately.',
      tags: ['fraud', 'forged', 'report']
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const popularTags = ['verification', 'employees', 'security', 'organizations', 'credentials'];

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const handleReset = () => {
    setSearchQuery('');
    setActiveIndex(null);
    setDisplayCount(6);
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 6, filteredFAQs.length));
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FiHelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about organization verification and employee management.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleReset}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Popular Tags */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredFAQs.length}</span>{' '}
              {filteredFAQs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* FAQ List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4 mb-8">
            {filteredFAQs.slice(0, displayCount).map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  aria-expanded={activeIndex === index}
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0">
                    {activeIndex === index ? (
                      <FiChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </span>
                </button>

                {activeIndex === index && (
                  <div className="px-6 pb-6 pt-2 animate-fadeIn">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {faq.answer}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faq.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <FiSearch className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No results found
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We couldn't find any FAQs matching "{searchQuery}". Try these popular topics:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show More Button */}
        {displayCount < filteredFAQs.length && (
          <div className="text-center">
            <button
              onClick={handleShowMore}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Show More
              <FiChevronDown className="ml-2 w-5 h-5" />
            </button>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            Can't find what you're looking for?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our support team is ready to help you with any questions about organization verification or employee management.
          </p>
          <a
            href="mailto:support@orgverify.com"
            className="inline-flex items-center px-8 py-3.5 bg-white text-blue-600 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FiMail className="mr-2" />
            Contact Support Team
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default FAQSection;