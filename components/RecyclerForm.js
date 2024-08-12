"use client";
import { Button } from '@nextui-org/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const RecyclerForm = () => {
    const { register, handleSubmit, setError, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();


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
                return {...form, images: [...links]}
            })
        }
        setIsUploading(false);
    }

    const updateImagesOrder = (imgOrder) => {
        setForm({...form, images: imgOrder});
    }

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const res = await axios.post('/api/register', data);

            if (res.status === 201) {
                setLoading(false);
                reset();
                router.push('/login')
            }
            else {
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

            

            {errors.formError && <span className="text-red-500">{errors.formError.message}</span>}

            <Button isLoading={loading} variant='solid' type='submit' color='primary' className='font-semibold w-32 mx-auto'>
                Register
            </Button>
        </form>
    );
}

export default RecyclerForm;
