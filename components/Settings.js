"use client";
import React, { useState } from 'react';
import { Settings, User, Recycle, Bell, Shield, CreditCard, HelpCircle, FileQuestion } from 'lucide-react';

const SettingsPane = ({ type }) => {
  const [activeTab, setActiveTab] = useState('account');

  const commonTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: FileQuestion },
  ];

  const userTabs = [
    ...commonTabs,
    { id: 'disposals', label: 'My Disposals', icon: Recycle },
  ];

  const recyclerTabs = [
    ...commonTabs,
    { id: 'collections', label: 'My Collections', icon: Recycle },
  ];

  const tabs = type === 'user' ? userTabs : recyclerTabs;

  const TabContent = ({ tabId }) => {
    const [formData, setFormData] = useState({});

    const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      // Here you would typically send the data to your backend
    };

    switch (tabId) {
      case 'account':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input type="text" id="name" name="name" onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input type="email" id="email" name="email" onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Save Changes</button>
          </form>
        );
      case 'notifications':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="emailNotifications" onChange={handleInputChange} className="mr-2" />
                Receive email notifications
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="smsNotifications" onChange={handleInputChange} className="mr-2" />
                Receive SMS notifications
              </label>
            </div>
            <button type="submit" className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Save Preferences</button>
          </form>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" id="current-password" name="currentPassword" onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" id="new-password" name="newPassword" onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input type="password" id="confirm-password" name="confirmPassword" onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <button type="submit" className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Update Password</button>
            </form>
            <div>
              <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="mb-2">Enhance your account security by enabling two-factor authentication.</p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Enable 2FA</button>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
              <p className="mb-2">You are currently on the <strong>Pro Plan</strong>.</p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Upgrade Plan</button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
              <p className="mb-2">Your current payment method is: <strong>Visa ending in 1234</strong></p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Update Payment Method</button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Billing History</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2023-08-01</td>
                    <td>$29.99</td>
                    <td>Paid</td>
                  </tr>
                  <tr>
                    <td>2023-07-01</td>
                    <td>$29.99</td>
                    <td>Paid</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="mb-2">Having issues? Our support team is here to help!</p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Contact Support</button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className="mb-2">Check out our comprehensive documentation for detailed guides and tutorials.</p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">View Documentation</button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
              <p className="mb-2">Learn how to use E-WasteMart effectively with our video tutorials.</p>
              <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Watch Tutorials</button>
            </div>
          </div>
        );
      case 'collections':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2">My Collections</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Weight</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2023-08-15</td>
                  <td>Electronics</td>
                  <td>50 kg</td>
                  <td>Completed</td>
                </tr>
                <tr>
                  <td>2023-08-10</td>
                  <td>Batteries</td>
                  <td>10 kg</td>
                  <td>In Progress</td>
                </tr>
                <tr>
                  <td>2023-08-05</td>
                  <td>Appliances</td>
                  <td>100 kg</td>
                  <td>Scheduled</td>
                </tr>
              </tbody>
            </table>
            <button className="bg-[rgb(103,232,67)] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Schedule New Collection</button>
          </div>
        );
      case 'faq':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">What is e-waste?</h4>
                <p>E-waste, or electronic waste, refers to discarded electrical or electronic devices. This includes computers, smartphones, televisions, and other electronic equipment that are no longer in use or have reached the end of their life cycle.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Why is proper e-waste management important?</h4>
                <p>Proper e-waste management is crucial because electronic devices often contain hazardous materials that can harm the environment and human health if not disposed of correctly. Additionally, many components in e-waste can be recycled and reused, conserving resources and reducing the need for new raw materials.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">How does E-WasteMart work?</h4>
                <p>E-WasteMart connects individuals and businesses with certified e-waste recyclers. Users can schedule pickups for their e-waste, which is then collected and processed by our network of recyclers. We ensure that all e-waste is handled in an environmentally responsible manner, maximizing recycling and proper disposal.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What types of e-waste does E-WasteMart accept?</h4>
                <p>We accept a wide range of electronic devices, including but not limited to computers, laptops, smartphones, tablets, printers, televisions, and small household appliances. For a complete list, please refer to our acceptable items page.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Is my data safe when I recycle my devices through E-WasteMart?</h4>
                <p>Yes, data security is one of our top priorities. All of our recycling partners are required to follow strict data destruction protocols. However, we always recommend that users remove and wipe all personal data from their devices before recycling as an extra precaution.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <p>Content for {tabId} tab</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Settings className="w-8 h-8" />
          {type === 'user' ? 'User Settings' : 'Recycler Settings'}
        </h1>
        <div className="flex flex-col md:flex-row gap-6">
          <nav className="md:w-1/4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-[rgb(103,232,67)] text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <main className="md:w-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold mb-4">{tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <TabContent tabId={activeTab} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPane;