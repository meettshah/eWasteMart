import DivWrapper from '@/components/DivWrapper'
import LoginForm from '@/components/LoginForm'
import React from 'react'

const LoginPage = () => {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <DivWrapper className={'border bg-white dark:bg-gray-900 py-10 max-w-[520px] mx-auto shadow-md rounded-lg'} title={'Login to E-WasteMart'}>
            <LoginForm />
        </DivWrapper>
    </main>
  )
}

export default LoginPage
