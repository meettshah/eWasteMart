import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data (replace with actual data fetching in a real application)
const mockRecyclerData = {
  name: "EcoRecycle Inc.",
  email: "info@ecorecycle.com",
  avatar: "profile1.png",
  orders: [
    { id: 1, date: "2024-08-01", items: "Old Laptop", status: "Completed" },
    { id: 2, date: "2024-08-05", items: "Broken Smartphone", status: "Processing" },
  ],
  salesStats: [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
  ],
  paymentHistory: [
    { id: 1, date: "2024-07-30", amount: 5000, status: "Paid" },
    { id: 2, date: "2024-08-15", amount: 6500, status: "Pending" },
  ],
  pricingDetails: [
    { product: "Old Laptop", price: 500 },
    { product: "Smartphone", price: 200 },
    { product: "CRT Monitor", price: 100 },
    { product: "LED TV", price: 300 },
  ]
};

const RecyclerProfile = () => {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={mockRecyclerData.avatar} 
            alt={mockRecyclerData.name} 
            className="h-20 w-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{mockRecyclerData.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{mockRecyclerData.email}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap">
          <button 
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              activeTab === 'info' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Basic Info
          </button>
          <button 
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              activeTab === 'orders' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
          <button 
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              activeTab === 'stats' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            Sales Statistics
          </button>
          <button 
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              activeTab === 'payments' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            Payment History
          </button>
          <button 
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              activeTab === 'pricing' 
                ? 'bg-[rgb(103,232,67)] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing Details
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Company Information</h3>
            <p className="dark:text-gray-300">Name: {mockRecyclerData.name}</p>
            <p className="dark:text-gray-300">Email: {mockRecyclerData.email}</p>
            {/* Add more recycler information here */}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Sales Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockRecyclerData.salesStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#D1D5DB" />
                <YAxis stroke="#D1D5DB" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.375rem', 
                    color: '#D1D5DB' 
                  }} 
                />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Payment History</h3>
            {mockRecyclerData.paymentHistory.map((payment) => (
              <div key={payment.id} className="border dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold dark:text-white">${payment.amount}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{payment.date}</p>
                <p className="dark:text-gray-300">Status: {payment.status}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Order History</h3>
            {mockRecyclerData.orders.map((order) => (
              <div key={order.id} className="border dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold dark:text-white">Order #{order.id}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.date}</p>
                <p className="dark:text-gray-300">Items: {order.items}</p>
                <p className="dark:text-gray-300">Status: {order.status}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold dark:text-white">Pricing Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {mockRecyclerData.pricingDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default RecyclerProfile
