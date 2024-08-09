"use client";
import DivWrapper from '@/components/DivWrapper'
import Form from '@/components/Form'
import axios from 'axios'
import React from 'react'

const Recyclers = () => {

  const handlePress = async () => {
    const response = await axios.post('/api/openai', {content: 'What is the capital of the United States?'})
    console.log(response);
  }

  return (
    <div>
      <button onClick={handlePress} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Button</button>
        <DivWrapper title={'Forms'}>
            <Form />
        </DivWrapper>
    </div>
  )
}

export default Recyclers