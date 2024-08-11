import Footer1 from '@/components/Footer1'
import Nav from '@/components/Nav'
import React from 'react'

const Template = ({ children }) => {
  return (
    <div>
      <Nav />
      {children}
      <Footer1 />
    </div>
  )
}

export default Template