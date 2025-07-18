import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('individual');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchData();
    checkPaymentStatus();
  }, []);

  const fetchData = async () => {
    try {
      const [personalResponse, coursesResponse, packagesResponse] = await Promise.all([
        fetch(`${backendUrl}/api/personal-info`),
        fetch(`${backendUrl}/api/courses`),
        fetch(`${backendUrl}/api/packages`)
      ]);

      const personalData = await personalResponse.json();
      const coursesData = await coursesResponse.json();
      const packagesData = await packagesResponse.json();

      setPersonalInfo(personalData);
      setCourses(coursesData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      showNotification('Payment status check timed out. Please check your email for confirmation.', 'error');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/payments/v1/checkout/status/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        showNotification('Payment successful! Thank you for your purchase.', 'success');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (data.status === 'expired') {
        showNotification('Payment session expired. Please try again.', 'error');
        return;
      }

      showNotification('Payment is being processed...', 'info');
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      showNotification('Error checking payment status. Please try again.', 'error');
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      max-width: 300px;
      background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const handlePayment = async (packageType, courseId = null) => {
    try {
      const currentUrl = window.location.href.split('?')[0];
      const successUrl = `${currentUrl}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = currentUrl;

      const requestBody = {
        package_type: packageType,
        course_id: courseId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          source: 'web_checkout',
          payment_type: packageType
        }
      };

      const response = await fetch(`${backendUrl}/api/payments/v1/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      showNotification(error.message, 'error');
      console.error('Payment error:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-gray-900">
              {personalInfo?.name || 'Portfolio'}
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#skills" className="text-gray-700 hover:text-blue-600 transition-colors">Skills</a>
              <a href="#experience" className="text-gray-700 hover:text-blue-600 transition-colors">Experience</a>
              <a href="#courses" className="text-gray-700 hover:text-blue-600 transition-colors">Courses</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Hi, I'm {personalInfo?.name}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-blue-100">
                {personalInfo?.title}
              </p>
              <p className="text-lg mb-8 text-blue-50">
                {personalInfo?.bio}
              </p>
              <div className="flex space-x-4">
                <a href="#courses" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  View Courses
                </a>
                <a href="#contact" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Contact Me
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={personalInfo?.profile_image}
                alt={personalInfo?.name}
                className="rounded-full w-80 h-80 object-cover border-4 border-white shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Skills & Technologies</h2>
            <p className="text-xl text-gray-600">Tools and technologies I work with</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {personalInfo?.skills?.map((skill, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-blue-50 transition-colors">
                <div className="text-lg font-semibold text-gray-900">{skill}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Experience</h2>
            <p className="text-xl text-gray-600">My journey in software development</p>
          </div>
          <div className="space-y-8">
            {personalInfo?.experience?.map((exp, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-gray-500 font-medium">{exp.duration}</div>
                </div>
                <p className="text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">My Courses</h2>
            <p className="text-xl text-gray-600">Learn from my experience and expertise</p>
          </div>

          {/* Course Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">{course.duration}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{course.rating} ({course.students} students)</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                  </div>
                  <button
                    onClick={() => handlePayment('individual', course.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Package Options */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Course Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Individual Course */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Individual Course</h4>
                <p className="text-gray-600 mb-4">Access to a single course of your choice</p>
                <p className="text-sm text-gray-500 mb-4">Price varies by course</p>
                <p className="text-gray-700 mb-4">Perfect for focused learning on specific topics</p>
                <button
                  onClick={() => {
                    const courseSelect = document.getElementById('course-select');
                    if (courseSelect) {
                      courseSelect.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Select Course Above
                </button>
              </div>

              {/* Bundle */}
              <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-semibold text-gray-900">Course Bundle</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">POPULAR</span>
                </div>
                <p className="text-gray-600 mb-4">Access to 3 courses of your choice</p>
                <p className="text-3xl font-bold text-blue-600 mb-4">$199.99</p>
                <p className="text-gray-700 mb-4">Save money with our bundle package</p>
                <button
                  onClick={() => handlePayment('bundle')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buy Bundle
                </button>
              </div>

              {/* Subscription */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Monthly Subscription</h4>
                <p className="text-gray-600 mb-4">Unlimited access to all courses</p>
                <p className="text-3xl font-bold text-green-600 mb-4">$49.99<span className="text-lg text-gray-500">/month</span></p>
                <p className="text-gray-700 mb-4">Cancel anytime, full access to all content</p>
                <button
                  onClick={() => handlePayment('subscription')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Let's connect and discuss opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">📧</div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{personalInfo?.contact?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">📱</div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">{personalInfo?.contact?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">📍</div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{personalInfo?.contact?.location}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Follow Me</h3>
              <div className="flex space-x-4">
                {personalInfo?.social_links && Object.entries(personalInfo.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2024 {personalInfo?.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;