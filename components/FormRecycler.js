"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@nextui-org/react";
import { ReactSortable } from "react-sortablejs";
import Spinner from "./Spinner";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";

const schema = yup.object().shape({
  name: yup.string().required("Full Name is required"),
  birthdate: yup.date().required("Date of Birth is required"),
  address: yup.string().required("Address is required"),
  typeWaste: yup.string().required("Gender is required"),
  images: yup.array().min(1, "At least one image is required"),
});

const FormRecycler = () => {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [properties, setProperties] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: session?.user?.email,
      address: "",
      typeWaste: "",
      images: [],
      properties: properties,
    },
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
  const images = watch("images");

  const uploadImages = async (ev) => {
    ev.preventDefault();
    const files = ev.target.files;
    if (!files.length) return;
    setIsUploading(true);

    try {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }

      const res = await axios.post("/api/upload", data);
      const links = res.data.links;

      setValue("images", links, { shouldValidate: true });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const updateImagesOrder = (imgOrder) => {
    setValue("images", imgOrder);
  };

  const onSubmit = async (data) => {
    console.log("Submitting form data:", data);
    try {
      await axios.post("/api/recycler", data);
      reset();
      console.log("Form data submitted:", data);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 border-gray-300 mx-auto px-10 shadow-md max-w-[600px] w-[600px] py-12 rounded-3xl'>
      <div className='flex flex-col '>
        <label htmlFor="name">Full Name</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              <input type="text" id="name" className="" {...field} />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </>
          )}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="types of waste">Select types of waste</label>
        <Controller
          name="typeWaste"
          control={control}
          render={({ field }) => (
            <>
              <select id="typesWaste" className="flex flex-col" {...field}>
                <option value="">Select</option>
                <option value="computers">Computers and Peripherals</option>
                <option value="mobile">Mobile and Personal Devices</option>
                <option value="televisions">Televisions and Displays</option>
                <option value="audio">Audio and Video Equipment</option>
                <option value="networking">Networking and Communication Devices</option>
                <option value="batteries">Batteries and Chargers</option>
                <option value="other">Other</option>
              </select>
              {errors.typeWaste && (
                <p className="text-red-500">{errors.typeWaste.message}</p>
              )}
            </>
          )}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="address">Address</label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <>
              <input
                type="text"
                id="address"
                className=""
                {...field}
              />
              {errors.address && (
                <p className="text-red-500">{errors.address.message}</p>
              )}
            </>
          )}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="description">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <>
              <textarea
                lines="3"
                id="description"
                className=""
                {...field}
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </>
          )}
        />
      </div>

      <label htmlFor="image">Person Images</label>
      <div className="mb-2 flex flex-wrap gap-2">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex gap-2"
        >
          {!!images?.length &&
            images.map((link, index) => (
              <div
                key={link} // Assuming link is unique
                className="bg-white border border-gray-300 shadow-md rounded-sm h-28"
              >
                <Image
                  className="image object-cover w-28 h-28"
                  width={100}
                  height={100}
                  src={link}
                  alt="product"
                />
              </div>
            ))}

        </ReactSortable>
        {isUploading && (
          <div className="flex justify-center items-center bg-white shadow-md border border-gray-300 w-28 h-28 rounded-sm cursor-pointer">
            <Spinner />
          </div>
        )}
        <label className="flex justify-center items-center gap-1 bg-white shadow-md border border-gray-400 w-28 h-28 rounded-sm cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Upload</div>
          <input
            type="file"
            onChange={uploadImages}
            className="hidden"
            multiple
          />
        </label>
      </div>
      {!images?.length && (
        <div className="text-red-600">No images for this person!</div>
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
      <Button
        variant="solid"
        type="submit"
        color="primary"
        className="font-semibold w-32 mx-auto"
      >
        Submit
      </Button>
    </form>
  );
};

export default FormRecycler;
