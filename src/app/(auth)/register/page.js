import DivWrapper from '@/components/DivWrapper'
import RegisterForm from '@/components/RegisterForm'
import React from 'react'

const RegisterPage = () => {
  return (
    <div>
        <DivWrapper className={'border py-10 max-w-[600px] mx-auto shadow-md rounded-lg'} title={'Welcome to E-WasteMart'}>
            <p>Fill this form to register.</p>
            <RegisterForm />
        </DivWrapper>
    </div>
  )
}

export default RegisterPage