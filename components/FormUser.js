"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@nextui-org/react';
import { ReactSortable } from 'react-sortablejs';
import Spinner from './Spinner';
import axios from 'axios';
import Image from 'next/image';
import './Form.css';

// Define the validation schema using Yup
const schema = yup.object().shape({
  name: yup.string().required('Full Name is required'),
  birthdate: yup.date().required('Date of Birth is required'),
  address: yup.string().required('Address is required'),
  gender: yup.string().required('Gender is required'),
  images: yup.array().min(1, 'At least one image is required')
});

const FormUser = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      birthdate: '',
      address: '',
      gender: '',
      images: []
    }
  });

  const images = watch('images');

  const uploadImages = async (ev) => {
    ev.preventDefault();
    const files = ev.target.files;
    if (!files.length) return;
    setIsUploading(true);

    try {
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }

      const res = await axios.post('/api/upload', data);
      const links = res.data.links;

      setValue('images', links, { shouldValidate: true });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const updateImagesOrder = (imgOrder) => {
    setValue('images', imgOrder);
  };

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/criminals', data);
      // Optionally reset form or handle success
      console.log('Form data submitted:', data);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
      <div className='flex flex-col'>
        <label htmlFor="name">Full Name</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              <input
                type="text"
                id='name'
                className='w-[400px]'
                {...field}
              />
              {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
            </>
          )}
        />
      </div>
      <div className='flex flex-col'>
        <label htmlFor="gender">Gender</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <>
              <select
                id='gender'
                className='flex flex-col'
                {...field}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className='text-red-500'>{errors.gender.message}</p>}
            </>
          )}
        />
      </div>
      <div className='flex gap-3'>
        <div className='flex flex-col'>
          <label htmlFor="dob">Date of Birth</label>
          <Controller
            name="birthdate"
            control={control}
            render={({ field }) => (
              <>
                <input
                  type="date"
                  id='dob'
                  className='w-[194px]'
                  {...field}
                />
                {errors.birthdate && <p className='text-red-500'>{errors.birthdate.message}</p>}
              </>
            )}
          />
        </div>
      </div>
      <div className='flex flex-col'>
        <label htmlFor="address">Address</label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <>
              <input
                type="text"
                id='address'
                className='w-[400px]'
                {...field}
              />
              {errors.address && <p className='text-red-500'>{errors.address.message}</p>}
            </>
          )}
        />
      </div>

      <label htmlFor="image">Person Images</label>
      <div className='mb-2 flex flex-wrap gap-2'>
        <ReactSortable list={images} setList={updateImagesOrder} className='flex gap-2'>
          {!!images?.length && images.map((link) => (
            <div key={link} className='bg-white border border-gray-300 shadow-md rounded-sm h-28'>
              <Image className='image object-cover w-28 h-28' width={100} height={100} src={link} alt="product" />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className='flex justify-center items-center bg-white shadow-md border border-gray-300 w-28 h-28 rounded-sm cursor-pointer'>
            <Spinner />
          </div>
        )}
        <label className='flex justify-center items-center gap-1 bg-white shadow-md border border-gray-400 w-28 h-28 rounded-sm cursor-pointer'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <div>Upload</div>
          <input type="file" onChange={uploadImages} className='hidden' multiple />
        </label>
      </div>
      {!images?.length && (
        <div className='text-red-600'>No images for this person!</div>
      )}
      <Button variant='solid' type='submit' color='primary' className='font-semibold w-32 mx-auto'>Submit</Button>
    </form>
  );
};

export default FormUser;
