import React, { useState, useEffect } from 'react';
import { RecycleIcon, Smartphone, Laptop, Battery } from 'lucide-react';

const ProfileFooter = ({ username }) => {
  const [recycledItems, setRecycledItems] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRecycledItems(prev => (prev < 100 ? prev + 1 : 0));
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-[100] p-6 m-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          E-Waste Fact
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Did you know? Recycling one million laptops saves the energy equivalent to the electricity used by 3,657 U.S. homes in a year!
        </p>
    </div>
  );
};

export default ProfileFooter;