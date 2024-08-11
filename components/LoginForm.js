"use client";
import { Button } from '@nextui-org/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const LoginForm = () => {
    const { register, handleSubmit, setError, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            // const usernameExists = await axios.get(`/api/check-username?username=${data.username}`);
            // if (usernameExists.data.exists) {
            //     setError('username', { type: 'manual', message: 'Username is already taken' });
            //     return;
            // }
            
            const res = await axios.post('/api/register', data);
            
            if(res.status === 201){
                setLoading(false);
                reset();
            }
            else{
                const errorData = res.data.message;
                setError(errorData.message);
                console.log("Something went wrong.");
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Form submission error:", error);
            setError('formError', { type: 'manual', message: 'Submission failed, please try again later.' });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <div className='flex flex-col'>
                <label htmlFor="username">Username</label>
                <input
                    {...register('username', { required: 'Username is required' })}
                    type="text"
                    id='username'
                    name='username'
                    className='w-[400px]'
                />
                {errors.username && <span className="text-red-500">{errors.username.message}</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor="role">Role</label>
                <select
                    {...register('role', { required: 'Role is required' })}
                    className='w-[400px]'
                >
                    <option value="">Select</option>
                    <option value="user">User</option>
                    <option value="recycler">Recycler</option>
                    <option value="corporate">Corporate</option>
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
                    className='w-[400px]'
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
                    className='w-[400px]'
                />
                {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            </div>

            {errors.formError && <span className="text-red-500">{errors.formError.message}</span>}

            <Button variant='solid' type='submit' color='primary' className='font-semibold w-32 mx-auto'>
                Submit
            </Button>
        </form>
    );
}

export default LoginForm;
