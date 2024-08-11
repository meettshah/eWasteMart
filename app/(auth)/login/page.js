import DivWrapper from '@/components/DivWrapper'
import LoginForm from '@/components/LoginForm'
import React from 'react'

const LoginPage = () => {
  return (
    <div>
        <DivWrapper className={'border py-10 max-w-[600px] mx-auto shadow-md rounded-lg'} title={'Login to E-WasteMart'}>
            <LoginForm />
        </DivWrapper>
    </div>
  )
}

export default LoginPage