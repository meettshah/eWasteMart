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
      

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              You&quot;ve helped recycle
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