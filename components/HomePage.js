"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import DivWrapper from "./DivWrapper";
import Chips from './Chips';
import { SSG_FALLBACK_EXPORT_ERROR } from "next/dist/lib/constants";
import { useRouter } from 'next/navigation';

// Feature Card Component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-4xl mb-4 text-violet-600 dark:text-violet-400">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  )
};

// Statistics Component
const StatItem = ({ value, label }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">{value}</div>
    <div className="text-gray-600 dark:text-gray-300">{label}</div>
  </motion.div>
);

// CTA Component
const CTA = () => {
  const router = useRouter();
  return(
    <motion.div
      className="bg-gradient-to-r from-violet-600 to-pink-500 p-12 rounded-lg text-white text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-4">Ready to Start Recycling?</h2>
      <p className="mb-6">Join our platform and make a difference today!</p>
      <motion.button
        onClick={() => router.push('/register')}
        className="bg-white text-violet-600 px-6 py-2 rounded-full font-semibold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}

const CardModal = ({ isOpen, onClose, card }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{card.title}</ModalHeader>
        <ModalBody>
          <Image
            alt={card.title}
            src={card.imgUrl}
            width={300}
            height={200}
            className="object-cover w-full"
          />
          <p>{card.description}</p>
          <p>{card.additionalInfo}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const cardData = [
  {
    "title": "Easy E-Waste Recycling",
    "description": "Dispose of electronics responsibly with our eco-friendly recycling platform.",
    "imgUrl": "/card_img_03.jpg",
    "additionalInfo": "Our platform simplifies the process of recycling electronic waste. We provide convenient drop-off locations and pickup services to ensure that your old electronics are disposed of properly, minimizing environmental impact."
  },
  {
    "title": "Recycling Partners",
    "description": "Partnering with certified recyclers ensures safe, compliant e-waste recycling.",
    "imgUrl": "/card_img_02.jpg",
    "additionalInfo": "We collaborate with a network of certified recycling partners who adhere to strict environmental and safety standards. This ensures that all e-waste is processed in compliance with regulations, protecting both the environment and data security."
  },
  {
    "title": "Environmental Impact",
    "description": "Reduce landfill waste and carbon footprint with every recycled item.",
    "imgUrl": "/card_img_05.jpg",
    "additionalInfo": "By choosing to recycle your e-waste through our platform, you're making a significant positive impact on the environment. We track and report on the amount of waste diverted from landfills and the reduction in carbon emissions achieved through our recycling efforts."
  },
  {
    "title": "Expert Support",
    "description": "Our experts provide personalized support for recycling and purchases.",
    "imgUrl": "/card_img_04.jpg",
    "additionalInfo": "Our team of recycling experts is available to provide guidance on proper e-waste disposal, answer your questions, and offer personalized recommendations. We're committed to making your recycling experience as smooth and informed as possible."
  }
];

const FrontPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleReadMore = (card) => {
    setSelectedCard(card);
    onOpen();
  };

  return (
    <>
      {/* ... (previous sections remain unchanged) ... */}
      {/* What We Offer Section */}
      <section className="py-20 px-4 dark:bg-black bg-white text-white">
        <div className="container mx-auto flex flex-col  gap-1 justify-center items-center">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white text-black">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Easy Connection"
              description="Connect with recyclers and clients effortlessly."
              icon="🔗"
            />
            <FeatureCard
              title="Secure Transactions"
              description="Safe and transparent e-waste management process."
              icon="🔒"
            />
            <FeatureCard
              title="Environmental Impact"
              description="Track and reduce your carbon footprint."
              icon="🌿"
            />
          </div>
        </div>
      </section>

      {/* Our Cards Section */}
      <DivWrapper title={'Our Cards'}>
        <div className="flex flex-nowrap justify-center gap-4 overflow-x-auto pb-4">
          {cardData.map((card, index) => (
            <Card
              key={index}
              isFooterBlurred
              radius="lg"
              className="border-none h-[400px] w-[300px] flex-shrink-0"
            >
              <Image
                alt={card.title}
                className="object-cover"
                height={500}
                src={card.imgUrl}
                width={300}
              />
              <CardFooter className="flex flex-col justify-center items-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl gap-3 rounded-large bottom-1 w-[98%] mx-[2px] h-[150px] shadow-small z-10">
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="text-tiny text-white/80">{card.description}</p>
                <Button
                  className="text-tiny text-white bg-black/20"
                  variant="flat"
                  color="default"
                  radius="lg"
                  size="sm"
                  onPress={() => handleReadMore(card)}
                >
                  Read More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DivWrapper>

      <AnimatePresence>
        {selectedCard && (
          <CardModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setSelectedCard(null);
            }}
            card={selectedCard}
          />
        )}
      </AnimatePresence>

      {/* ... (remaining sections stay the same) ... */}
      {/* Making a Difference Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto flex flex-col  gap-1 justify-center items-center">
          <h2 className="text-3xl font-bold text-center mb-12 text-black dark:text-white">Making a Difference</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <StatItem value="10,000+" label="Users" />
            <StatItem value="5,000+" label="Tons Recycled" />
            <StatItem value="500+" label="Partners" />
          </div>
        </div>
      </section>

      {/* Ready to Start Recycling Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <CTA />
        </div>
      </section>
    </>
  )
}

export default FrontPage;