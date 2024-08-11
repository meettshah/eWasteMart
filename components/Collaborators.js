"use client";

import React, { useState, useEffect } from 'react';

const collaborators = [
  { id: 1, name: 'Samsung', logo: 'samsung.png', speciality: 'Electronics', impact: '1000 tons recycled', process: 'Samsung uses advanced sorting technologies to separate different materials and employs a closed-loop recycling system to maximize resource recovery.' },
  { id: 2, name: 'HP', logo: 'hp.png', speciality: 'Computers', impact: '750 tons recycled', process: 'HP focuses on designing products for easy disassembly and recycling, and partners with local recycling facilities to ensure proper handling of e-waste.' },
  { id: 3, name: 'Apple', logo: 'apple.png', speciality: 'Mobile Devices', impact: '1200 tons recycled', process: 'Apple utilizes robotic disassembly systems like Daisy to efficiently recover valuable materials from iPhones and other devices.' },
  { id: 4, name: 'Dell', logo: 'dell.png', speciality: 'Laptops', impact: '600 tons recycled', process: 'Dell operates a global takeback program and uses innovative recycling techniques to turn plastic from old electronics into new products.' },
  { id: 5, name: 'LG', logo: 'lg.png', speciality: 'Home Appliances', impact: '800 tons recycled', process: 'LG implements a comprehensive recycling process that includes collection, sorting, and material recovery, with a focus on reducing environmental impact.' },
];

const CollaboratorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCollaborators, setFilteredCollaborators] = useState(collaborators);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);

  useEffect(() => {
    const filtered = collaborators.filter(collaborator =>
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCollaborators(filtered);
  }, [searchTerm]);

  const handleLearnMore = (collaborator) => {
    setSelectedCollaborator(collaborator);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">Our E-Waste Recycling Partners</h1>
      
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search collaborators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCollaborators.map((collaborator) => (
          <div key={collaborator.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
            <div className="text-center p-6">
              <img src={collaborator.logo} alt={`${collaborator.name} logo`} className="w-24 h-24 mx-auto rounded-full" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">{collaborator.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{collaborator.speciality}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-center text-gray-700 dark:text-gray-300">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">
                  Impact
                </span>
                <br />
                {collaborator.impact}
              </p>
            </div>
            <div className="px-6 pt-4 pb-6 text-center">
              <button 
                className="bg-primary hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                onClick={() => handleLearnMore(collaborator)}
              >
                Learn More
              </button>
            </div>
            {selectedCollaborator && selectedCollaborator.id === collaborator.id && (
              <div className="px-6 py-4 bg-gray-100 dark:bg-gray-700">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">E-Waste Management Process</h3>
                <p className="text-gray-600 dark:text-gray-300">{collaborator.process}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Join Our Mission</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Are you a company with recycling facilities? Partner with E-WasteMart to make a positive impact on the environment.
        </p>
        <button className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
          Become a Collaborator
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsPage;