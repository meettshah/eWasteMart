import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Battery } from 'lucide-react';

const ProfileHeader = ({ username }) => {
  const [recycledItems, setRecycledItems] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRecycledItems(prev => (prev < 100 ? prev + 1 : 0));
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
        Welcome, {username = "Mikey"}!
      </h1>
      
      <div className="mb-6">
      <svg viewBox="0 0 300 300" className="w-full h-64">

  {/* Main green circle */}
  <circle cx="150" cy="150" r="120" fill="none" stroke="#4CAF50" strokeWidth="4" />

  {/* Rotating circles and icons */}
  <g>
    <g transform="rotate(0 150 150)">
      <circle cx="150" cy="30" r="20" fill="#FF69B4" />
      <text x="150" y="30" textAnchor="middle" fill="white" fontSize="12" dy=".3em">Use</text>
    </g>

    <g transform="rotate(90 150 150)">
      <circle cx="150" cy="30" r="20" fill="#DE1460" />
      <text x="150" y="30" textAnchor="middle" fill="white" fontSize="12" dy=".3em">Collect</text>
    </g>

    <g transform="rotate(180 150 150)">
      <circle cx="150" cy="30" r="20" fill="#FFA500" />
      <text x="150" y="30" textAnchor="middle" fill="white" fontSize="12" dy=".3em">Recycle</text>
    </g>

    <g transform="rotate(270 150 150)">
      <circle cx="150" cy="30" r="20" fill="#00BFFF" />
      <text x="150" y="30" textAnchor="middle" fill="white" fontSize="12" dy=".3em">Manufacture</text>
    </g>

    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 150 150"
      to="360 150 150"
      dur="20s"
      repeatCount="indefinite"
    />
  </g>
  <g>
    <circle cx="150" cy="150" r="40" fill="#ECEFF1" />
    <path d="M150,115 L150,185 M130,135 L170,165 M130,165 L170,135" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 150 150"
        to="360 150 150"
        dur="10s"
        repeatCount="indefinite"
      />
    </path>
  </g>

  {/* Animated e-waste item */}
  <g transform="translate(170, 170)">
    <rect x="-5" y="-55" width="10" height="15" fill="#FFD700">
      <animateMotion
        path="M0,0 a60,60 0 1,1 0,0.1"
        dur="5s"
        repeatCount="indefinite"
      />
    </rect>
  </g>
</svg>

      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              You've helped recycle
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {recycledItems} items
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <Smartphone className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Phones</span>
          </div>
          <div className="flex flex-col items-center">
            <Laptop className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Laptops</span>
          </div>
          <div className="flex flex-col items-center">
            <Battery className="w-8 h-8 text-yellow-500 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Batteries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;