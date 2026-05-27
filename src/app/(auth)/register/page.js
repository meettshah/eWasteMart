import DivWrapper from '@/components/DivWrapper'
import RegisterForm from '@/components/RegisterForm'
import React from 'react'

const RegisterPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <DivWrapper className={'border bg-white dark:bg-gray-900 py-10 max-w-[560px] mx-auto shadow-md rounded-lg'} title={'Create your E-WasteMart account'}>
            <p className="mb-5 text-gray-600 dark:text-gray-300">Choose the role that matches how you will use the marketplace.</p>
            <RegisterForm />
        </DivWrapper>
    </main>
  )
}

export default RegisterPage
