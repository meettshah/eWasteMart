"use client";
import AuthWrapper from '@/components/AuthWrapper';
import Chatbot from '@/components/ChatBox'
import Footer1 from '@/components/Footer1'
import Nav from '@/components/Nav'
import React from 'react'

const Template = ({ children }) => {

  return (
    <div>
      <AuthWrapper>
        <Nav />
        {children}
        <Chatbot />
        <Footer1 />
      </AuthWrapper>
    </div>
  )
}

export default Template