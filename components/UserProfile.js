import React, { useState } from 'react';

// Mock data (replace with actual data fetching in a real application)
const mockUserData = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "profile1.png",
  orders: [
    { id: 1, date: "2024-08-01", items: "Old Laptop", status: "Completed" },
    { id: 2, date: "2024-08-05", items: "Broken Smartphone", status: "Processing" },
  ]
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={mockUserData.avatar} 
            alt={mockUserData.name} 
            className="h-20 w-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{mockUserData.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{mockUserData.email}</p>
          </div>
        </div>

        <div className="mb-4">
          <button 
            className={`mr-2 px-4 py-2 rounded ${
              activeTab === 'info' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Basic Info
          </button>
          <button 
            className={`px-4 py-2 rounded ${
              activeTab === 'orders' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Personal Information</h3>
            <p className="dark:text-gray-300">Name: {mockUserData.name}</p>
            <p className="dark:text-gray-300">Email: {mockUserData.email}</p>
            {/* Add more user information here */}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Order History</h3>
            {mockUserData.orders.map((order) => (
              <div key={order.id} className="border dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold dark:text-white">Order #{order.id}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.date}</p>
                <p className="dark:text-gray-300">Items: {order.items}</p>
                <p className="dark:text-gray-300">Status: {order.status}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
