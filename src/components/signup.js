"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@nextui-org/react';
import './Form.css';


const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  reenterPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Re-enter Password is required'),
  mobileNumber: yup.string().required('Mobile number is required'),
  address: yup.string().required('Address is required'),
  select: yup.string().required('Please select an option')
});

const SignUpForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
      <div className='box center'>
        <div className='flex flex-col'>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className='w-[400px]'
          />
          {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="mobileNumber">Mobile number</label>
          <input
            type="text"
            id="mobileNumber"
            {...register('mobileNumber')}
            className='w-[400px]'
          />
          {errors.mobileNumber && <p className='text-red-500'>{errors.mobileNumber.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className='w-[400px]'
          />
          {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id='address'
            {...register('address')}
            className='w-[400px]'
          />
          {errors.address && <p className='text-red-500'>{errors.address.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className='w-[400px]'
          />
          {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="reenterPassword">Re-enter Password</label>
          <input
            type="password"
            id="reenterPassword"
            {...register('reenterPassword')}
            className='w-[400px]'
          />
          {errors.reenterPassword && <p className='text-red-500'>{errors.reenterPassword.message}</p>}
        </div>
        <div className='flex flex-col'>
          <label htmlFor="select">Select one</label>
          <select
            id="select"
            {...register('select')}
            className='flex flex-col'
          >
            <option value="">Select an option</option>
            <option value="option1">User</option>
            <option value="recyclers">Recyclers</option>
            <option value="scrappers">Scrappers</option>
          </select>
          {errors.select && <p className='text-red-500'>{errors.select.message}</p>}
        </div>
        <Button type="submit" variant="solid" color="primary" className='font-semibold w-32 mx-auto'>
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
