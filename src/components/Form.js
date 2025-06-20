"use client";
import { Button } from '@nextui-org/react'
import React from 'react'
import { useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import Spinner from './Spinner';
import axios from 'axios';
import Image from 'next/image';

const Form = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        birthdate: "",
        height: "",
        aadhar: "",
        pan: "",
        images: [],
        act: [],
        section: [],
        crime: "",
        address: "",
        parent_name: "",
        identification_mark: "",
        educational_qualification: "",
        gender: "",
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = await axios.post('/api/criminals', form);
        setForm({
            name: "",
            birthdate: "",
            height: "",
            aadhar: "",
            pan: "",
            images: [],
            act: [],
            section: [],
            crime: "",
            address: "",
            parent_name: "",
            identification_mark: "",
            educational_qualification: "",
            gender: "",
        })
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>

            <div className='flex flex-col'>
                <label htmlFor="name">Full Name</label>
                <input onChange={(e) => { setForm({ ...form, name: e.target.value }) }} value={form.name} type="text" id='name' name='name' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="gender" >Gender</label>
                <select onChange={(e) => { setForm({ ...form, gender: e.target.value }) }} value={form.gender} className='flex flex-col'>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className='flex gap-3'>
                <div className='flex flex-col'>
                    <label htmlFor="dob">Date of Birth</label>
                    <input onChange={(e) => { setForm({ ...form, birthdate: e.target.value }) }} value={form.birthdate} type="date" id='dob' name='dob' className='w-[194px]' />
                </div>
                <div className='flex flex-col gap'>
                    <label htmlFor="height">Height</label>
                    <input onChange={(e) => { setForm({ ...form, height: e.target.value }) }} value={form.height} type="int" id='height' name='height' className='w-[194px]' />
                </div>

            </div>
            <div className='flex flex-col'>
                <label htmlFor="adhar">Adhar Number</label>
                <input onChange={(e) => { setForm({ ...form, aadhar: e.target.value }) }} value={form.aadhar} type="text" id='adhar' name='adhar' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="pan">PAN Number</label>
                <input onChange={(e) => { setForm({ ...form, pan: e.target.value }) }} value={form.pan} type="text" id='pan' name='pan' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="gname">Gaurdian Name</label>
                <input onChange={(e) => { setForm({ ...form, parent_name: e.target.value }) }} value={form.parent_name} type="text" id='gname' name='gname' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="idmark">Identification Mark</label>
                <input onChange={(e) => { setForm({ ...form, identification_mark: e.target.value }) }} value={form.identification_mark} type="text" id='idmark' name='idmark' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="address">Address</label>
                <input onChange={(e) => { setForm({ ...form, address: e.target.value }) }} value={form.address} type="text" id='address' name='address' className='w-[400px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="education" >Education</label>
                <select onChange={(e) => { setForm({ ...form, educational_qualification: e.target.value }) }} value={form.educational_qualification} className='flex flex-col'>
                    <option value="option1">Select</option>
                    <option value="12 Pass">12 Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="PHD">PHD</option>
                </select>
            </div>
            <div className='flex flex-col'>
                <label htmlFor="sections" >Sections</label>
                <select onChange={(e) => { setForm({ ...form, section: e.target.value }) }} value={form.section}>

                    <option value="select">Select</option>
                    <option value="Fundamental Rights">Fundamental Right</option>
                    <option value="Directive Principles">Directive Principles of State Policy</option>
                    <option value="Union Government">Union Government</option>
                    <option value="State Government">State Government</option>
                    <option value="Judiciary">Judiciary</option>
                    <option value="Elections">Elections</option>
                    <option value="Amendments">Amendments</option>
                </select>
            </div>

            <div className='flex flex-col'>
                <label htmlFor="crimes">Created Crimes</label>
                <textarea onChange={(e) => { setForm({ ...form, crime: e.target.value }) }} value={form.crime} id='crimes' name='crimes' className='w-[400px] h-[125px]' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="article">Article</label>
                <input onChange={(e) => { setForm({ ...form, act: e.target.value }) }} value={form.act} type="text" id='article' name='article' className='w-[400px]' />
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
            <Button variant='solid' type='submit' color='primary' className='font-semibold w-32 mx-auto'>Submit</Button>
        </form>
    )
}

export default Form