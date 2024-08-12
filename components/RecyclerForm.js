"use client";
import { Button } from '@nextui-org/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ReactSortable } from 'react-sortablejs';
import Spinner from '@/components/Spinner';
import DivWrapper from './DivWrapper';
import Image from 'next/image';

const RecyclerForm = () => {
    const { register, handleSubmit, setError, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        images: [],
    });


    const addProperty = () => {
        setProperties((prev) => {
            return [...prev, { name: "", values: "" }];
        });
    };
    const removeProperty = (index) => {
        setProperties((prev) => {
            const newProperties = [...prev];
            newProperties.splice(index, 1);
            return newProperties;
        });
    };
    const propertyNameChange = (index, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index].name = value;
        setProperties(updatedProperties);
    };

    const propertyValueChange = (index, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index].values = value;
        setProperties(updatedProperties);
    };


    const uploadImages = async (ev) => {
        ev.preventDefault();
        const files = ev.target.files;
        for (const file of files) {


            if (!file) return;
            setIsUploading(true);


            // Creating a new FormData object
            const data = new FormData();

            // Setting file in the formdata object
            data.append('file', file);

            // Sending the post request

            const res = await axios.post('/api/upload', data);
            const links = res.data.links;

            setForm(() => {
                return { ...form, images: [...links] }
            })
        }
        setIsUploading(false);
    }

    const updateImagesOrder = (imgOrder) => {
        setForm({ ...form, images: imgOrder });
    }

    const onSubmit = async (data) => {

        setLoading(true);
        setForm({...form, ...data, properties});

        console.log("Forms Data : ", form)

        const res = await axios.post('/api/recycler', form);

        console.log('Response:', data);

        setLoading(false);
    };

    return (
        <DivWrapper className={'border rounded-xl py-4 px-0'} title={'Recycler Form'}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                <div className='flex flex-col'>
                    <label htmlFor="name">Full Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        id='name'
                        name='name'
                        className='w-[400px]'
                    />
                    {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="typeWaste">Type of waste</label>
                    <select
                        {...register('typeWaste', { required: 'Type of waste is required' })}
                        className='w-[400px]'
                    >
                        <option value="">Select</option>
                        <option value="computers">Computers and Peripherals</option>
                        <option value="mobile">Mobile and Personal Devices</option>
                        <option value="televisions">Televisions and Displays</option>
                        <option value="audio">Audio and Video Equipment</option>
                        <option value="networking">Networking and Communication Devices</option>
                        <option value="batteries">Batteries and Chargers</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.typeWaste && <span className="text-red-500">{errors.typeWaste.message}</span>}
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="address">Address</label>
                    <input
                        {...register('address', { required: 'Address is required' })}
                        type="text"
                        id='address'
                        name='address'
                        className='w-[400px]'
                    />
                    {errors.address && <span className="text-red-500">{errors.address.message}</span>}
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="description">Description</label>
                    <input
                        {...register('description', { required: 'Address is required' })}
                        type="text"
                        id='description'
                        name='description'
                        className='w-[400px]'
                    />
                    {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                </div>

                <label htmlFor="image">Person Images</label>
                <div className='mb-2 flex flex-wrap gap-2'>
                    <ReactSortable list={form.images} setList={updateImagesOrder} className='flex gap-2' >
                        {!!form.images?.length && form.images.map((link) => {
                            return (
                                <div key={link} className='bg-white border border-gray-300 shadow-md rounded-sm h-28'>
                                    <Image className='image object-cover w-28 h-28' width={100} height={100} src={link} alt="product" />
                                </div>
                            )
                        })}
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

                        <div>
                            Upload
                        </div>
                        <input type="file" onChange={uploadImages} className='hidden' />
                    </label>
                </div>
                {!form.images?.length && (
                    <div className='text-red-600'>No images for this person !</div>
                )}

                <div className="my-4">
                    <div className="flex justify-between">
                        <h1>e-Waste Pricing</h1>
                        <button
                            type="button"
                            onClick={addProperty}
                            className="bg-primary text-white font-semibold px-2 py-1 rounded-md text-sm"
                        >
                            Add New Product
                        </button>
                    </div>
                    {properties.length > 0 &&
                        properties.map((property, index) => (
                            <div key={index} className="flex gap-1 mt-2">
                                <input
                                    value={property.name}
                                    onChange={(ev) => {
                                        propertyNameChange(index, ev.target.value);
                                    }}
                                    className="m-0"
                                    type="text"
                                    placeholder="Product Name"
                                />
                                <input
                                    value={property.values}
                                    onChange={(ev) => {
                                        propertyValueChange(index, ev.target.value);
                                    }}
                                    className="m-0"
                                    type="text"
                                    placeholder="Price (in Rs.)"
                                />
                                <button
                                    onClick={() => {
                                        removeProperty(index);
                                    }}
                                    type="button"
                                    className="btn-red bg-danger px-4 rounded-lg border-none  font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}


                </div>

                {errors.formError && <span className="text-red-500">{errors.formError.message}</span>}

                <Button isLoading={loading} variant='solid' type='submit' color='primary' className='font-semibold w-32 mx-auto'>
                    Register
                </Button>
            </form>
        </DivWrapper>
    );
}

export default RecyclerForm;
