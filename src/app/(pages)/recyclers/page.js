"use client";
import React, { useState } from "react";

const Recyclers = () => {
  const [selectedRecycler, setSelectedRecycler] = useState(null);

  const recyclers = [
    {
      name: "Bonnie Green",
      role: "CEO & Web Developer",
      description: "Bonnie drives the technical strategy of the flowbite platform and brand.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png",
      policy: "Our policy focuses on responsible e-waste management and data security.",
      pricePoint: "We offer competitive rates based on the type and condition of e-waste.",
      terms: "All e-waste must be properly packaged and free of hazardous materials.",
    },
    {
      name: "James Smith",
      role: "CTO & Software Engineer",
      description: "James leads the technical innovations and development processes at our company.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png",
      policy: "We prioritize sustainable practices and aim to minimize our carbon footprint.",
      pricePoint: "Our rates are tailored to the complexity and volume of the e-waste.",
      terms: "Ensure that all devices are wiped of personal data before submission.",
    },
    {
      name: "Emily Johnson",
      role: "Head of Operations",
      description: "Emily oversees the day-to-day operations and ensures smooth workflow management.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png",
      policy: "Our policy emphasizes transparency and ethical recycling methods.",
      pricePoint: "We offer flexible pricing based on bulk submissions and e-waste types.",
      terms: "All submissions should be accompanied by an inventory list and must adhere to our safety guidelines.",
    },
    {
      name: "Michael Brown",
      role: "Chief Marketing Officer",
      description: "Michael drives our marketing strategies and builds brand awareness.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/sofia-mcguire.png",
      policy: "We are committed to promoting responsible disposal of e-waste.",
      pricePoint: "Competitive rates are available for large-scale recycling projects.",
      terms: "E-waste should be delivered to our facility in accordance with local regulations.",
    },
    {
      name: "Sophia Williams",
      role: "Customer Support Manager",
      description: "Sophia ensures top-notch customer service and client satisfaction.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png",
      policy: "Our customer-first policy guarantees prompt and efficient service.",
      pricePoint: "Pricing is determined by the type and condition of the e-waste, with discounts for returning customers.",
      terms: "All devices must be free of personal data and hazardous materials before collection.",
    },
    {
      name: "Liam Davis",
      role: "Senior Environmental Analyst",
      description: "Liam conducts research and provides insights on environmental impact reduction.",
      image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png",
      policy: "We are dedicated to reducing electronic waste and promoting eco-friendly practices.",
      pricePoint: "Our rates are competitive, reflecting the quality of service and environmental benefits.",
      terms: "Ensure that all e-waste is sorted and categorized before submission for efficient processing.",
    },
  ];

  const toggleRecyclerInfo = (index) => {
    setSelectedRecycler(selectedRecycler === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center mb-8 lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Recyclers
          </h2>
          <p className="font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400">
            Explore the world&lsquo;s best recyclers and start recycling today.
          </p>
        </div>
        <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
          {recyclers.map((recycler, index) => (
            <div
              key={index}
              className="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-800 dark:border-gray-700"
            >
              <a href="#">
                <img
                  className="w-full rounded-lg sm:rounded-none sm:rounded-l-lg"
                  src={recycler.image}
                  alt={`${recycler.name} Avatar`}
                />
              </a>
              <div className="p-5">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <a href="#">{recycler.name}</a>
                </h3>
                <span className="text-gray-500 dark:text-gray-400">
                  {recycler.role}
                </span>
                <p className="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">
                  {recycler.description}
                </p>
                <button
                  onClick={() => toggleRecyclerInfo(index)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Show Info
                </button>
                {/* Social media links */}
                <ul className="flex space-x-4 sm:mt-0">
                  {/* ... (keep the existing social media SVG icons) ... */}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedRecycler !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {recyclers[selectedRecycler].name}
              </h3>
              <div className="mt-2 px-7 py-3">
                <h4 className="font-bold text-gray-900 dark:text-white">Policy:</h4>
                <p className="text-gray-700 dark:text-gray-300">{recyclers[selectedRecycler].policy}</p>
                <h4 className="font-bold text-gray-900 dark:text-white mt-2">Price Point:</h4>
                <p className="text-gray-700 dark:text-gray-300">{recyclers[selectedRecycler].pricePoint}</p>
                <h4 className="font-bold text-gray-900 dark:text-white mt-2">Terms & Conditions:</h4>
                <p className="text-gray-700 dark:text-gray-300">{recyclers[selectedRecycler].terms}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setSelectedRecycler(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recyclers;