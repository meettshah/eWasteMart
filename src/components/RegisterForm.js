"use client";
import { Button } from '@nextui-org/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
    const { register, handleSubmit, setError, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            
            const res = await axios.post('/api/register', data);

            if(res.status === 201){
                setLoading(false);
                reset();
                router.push('/login')
            }
        } catch (error) {
            setLoading(false);
            console.error("Form submission error:", error);
            setError('formError', { type: 'manual', message: error.response?.data?.message || 'Registration failed, please try again.' });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <div className='flex flex-col'>
                <label htmlFor="name">Full Name</label>
                <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    id='name'
                    name='name'
                    className='w-full'
                />
                {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor="role">Role</label>
                <select
                    {...register('role', { required: 'Role is required' })}
                    className='w-full'
                >
                    <option value="">Select</option>
                    <option value="user">User - individual seller</option>
                    <option value="bulk_seller">Bulk Seller - organization or industry</option>
                    <option value="recycler">Recycler - recycling agency or industry</option>
                    <option value="enterprise">Enterprise - brand recycle programme</option>
                </select>
                {errors.role && <span className="text-red-500">{errors.role.message}</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor="email">Email</label>
                <input
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: 'Invalid email address' }
                    })}
                    type="email"
                    id='email'
                    name='email'
                    className='w-full'
                />
                {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor="password">Password</label>
                <input
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                    })}
                    type="password"
                    id='password'
                    name='password'
                    className='w-full'
                />
                {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            </div>

            {errors.formError && <span className="text-red-500">{errors.formError.message}</span>}

            <Button isLoading={loading} variant='solid' type='submit' color='primary' className='font-semibold w-full'>
                Register
            </Button>
        </form>
    );
}

export default RegisterForm;
