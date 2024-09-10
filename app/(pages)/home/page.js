"use client";
import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen dark:bg-black bg-white">
     

      <main className="container mx-auto mt-8 p-4">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold dark:bg-black bg-white mb-4">Welcome to E-WasteMart</h2>
          <p className="text-xl text-gray-600">Your one-stop shop for responsible e-waste management</p>
        </section>
        <div>
        <div className="min-h-screen dark:bg-black bg-white">
     
      
      <main className="container mx-auto mt-12 p-4 w-[1000px] ml-12">
    

      
        <section className="dark:bg-gray-900 bg-white h-64 rounded-xl shadow-2xl mb-2 overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img className="h-64 w-full object-cover md:w-48" src="/card_img_02.jpg" alt="E-waste recycling" />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-green-500 font-semibold"></div>
              <h3 className="mt-1 text-2xl font-semibold text-black dark:text-white">Revolutionizing E-Waste Management</h3>
              <p className="mt-2 text-black dark:text-white">
                E-WasteMart is your one-stop solution for responsible electronics recycling and refurbishment. 
                We&quot;re on a mission to reduce e-waste, promote sustainable practices, and create a circular economy 
                for electronics. Whether you&quot;re looking to sell your old devices, buy refurbished products, or 
                learn about eco-friendly disposal methods, we&quot;ve got you covered.
              </p>
              <div className="mt-4 flex space-x-4">
                <Link href="/about" className="inline-block bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300">
                  Learn More
                </Link>
                <Link href="/recyclers" className="inline-block border border-green-500 text-green-500 px-4 py-2 rounded-full hover:bg-green-50 transition duration-300">
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>

       
      </main>
      <main className="container mx-auto mt-12 p-4  w-[1000px] animate mr-12">
    

      
        <section className="dark:bg-gray-900 bg-white h-64 rounded-xl shadow-2xl mb-2 overflow-hidden">
          <div className="md:flex">
          
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-green-500 font-semibold"></div>
              <h3 className="mt-1 text-2xl font-semibold text-black dark:text-white">Empowering a Greener Future</h3>
              <p className="mt-2 text-black dark:text-white">
              At E-WasteMart, we believe that every device has the potential to contribute to a sustainable future. By giving new life to old electronics, we empower individuals and businesses to make environmentally conscious decisions. Join us in our commitment to reducing waste, conserving resources, and fostering a cleaner, greener planet for generations to come.
              </p>
              <div className="mt-4 flex space-x-4">
                <Link href="/about" className="inline-block bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300">
                  Learn More
                </Link>
                <Link href="/recyclers" className="inline-block border border-green-500 text-green-500 px-4 py-2 rounded-full hover:bg-green-50 transition duration-300">
                  Our Services
                </Link>
              </div>
            </div>
            <div className="md:flex-shrink-0">
              <img className="h-64 w-full object-cover md:w-48" src="/card_img_04.jpg" alt="E-waste recycling" />
            </div>
          </div>
        </section>

       
      </main>
      
      
    </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-xl text-black dark:text-white font-semibold mb-2">Sell Your E-Waste</h3>
            <p className="text-black dark:text-white mb-4">Get paid for your old electronics</p>
            <Link href="/recyclers" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Start Selling
            </Link>
          </div>
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-xl text-black dark:text-white font-semibold mb-2">Buy Refurbished Items</h3>
            <p className="text-black dark:text-white mb-4">Find great deals on refurbished electronics</p>
            <Link href="/collaborators" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Shop Now
            </Link>
          </div>
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
            <h3 className="text-xl text-black dark:text-white font-semibold mb-2">Recycle Responsibly</h3>
            <p className="text-black dark:text-white mb-4">Learn about our eco-friendly recycling process</p>
            <Link href="/about-us" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Learn More
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
};

export default HomePage;