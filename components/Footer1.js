"use client";
import { useState } from "react";
import ListComponent from "./ListComponent";
import Image from "next/image";

const Footer1 = () => {
  const listHeadStyle = `dark:text-zinc-200 text-zinc-900 font-bold text-lg font-semibold`;
  const listStyles = `dark:text-gray-300 text-gray-600 text-sm  md:text-base `;
  return (
    <>
      <div
        className={`dark:bg-gray-200 bg-black w-full`}
      >
        <div
          className={`pt-10 md:pt-16 dark:bg-black bg-white flex flex-col justify-start w-full text-white gap-10`}
        >

          <footer className=" w-11/12 mx-auto  flex flex-col gap-10 pb-10">
            <div className="  flex flex-col md:flex-row gap-16 md:gap-16 xl:gap-20 border-b border-gray-700 pb-12 ">
              <div className=" flex flex-col gap-4 md:w-1/4">
                <div className="logo flex items-center gap-4">
                  <Image 
                    src={"/logo.png"}
                    width={40}
                    height={40}
                    className="h-12 w-12 object-cover"
                    alt="logo"
                  />
                  <p
                    className={`text-2xl font-semibold dark:text-zinc-200 text-zinc-900`}
                  >
                    E-WasteMart
                  </p>
                </div>
                <p className={`${listStyles} text-wrap w-full leading-6`}>
                  We are providing platform for high authorities to check on the criminal records of a person.{" "}
                </p>{" "}
              </div>
              <div className=" flex flex-col gap-3 md:gap-6">
                <p className={listHeadStyle}>Features</p>
                <ul className="flex flex-col gap-2">
                  <li className={listStyles}>
                    {" "}
                    <ListComponent href={'#'} btnText="Track Records" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Easy Access" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Authorized" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Trusted" />
                  </li>
                </ul>
              </div>
              <div className=" flex flex-col gap-3 md:gap-6">
                <p className={listHeadStyle}>Resources</p>
                <ul className="flex flex-col gap-2">
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Support Center" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Documentation" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Community" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'#'} btnText="Hoting" />
                  </li>
                </ul>
              </div>
              <div className=" flex flex-col gap-3 md:gap-6">
                <p className={listHeadStyle}>Follow Us</p>
                <ul className="flex flex-col gap-2">
                  <li className={listStyles}>
                    <ListComponent href={'https://www.linkedin.com/in/dev-patel-186282d?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app '} btnText="LinkedIn" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'https://github.com/devp1866 '} btnText="GitHub" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={'https://discord.com/invite/3T5znQSu'} btnText="Discord" />
                  </li>
                  <li className={listStyles}>
                    <ListComponent href={' https://x.com/devpatel_7?s=08 '} btnText="X" />
                  </li>
                </ul>
              </div>
              <div className=" flex flex-col gap-2 md:gap-6">
                <p className={listHeadStyle}>Get in touch</p>
                <p
                  className={` dark:text-zinc-200 text-zinc-800 text-sm font-base`}
                >
                  <ListComponent href={'#'} btnText="e-wastemart.123@gmail.com" />
                </p>
                <ul
                  className={`flex gap-3 dark:text-zinc-200 text-zinc-950`}
                >
                  <li className=" hover:-translate-y-1 transition-transform cursor-pointer hover:text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-instagram"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </li>
                  <li className="hover:-translate-y-1 transition-transform cursor-pointer hover:text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-twitter "
                    >
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </li>
                  <li className="hover:-translate-y-1 transition-transform cursor-pointer hover:text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className=" feather feather-facebook"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className={`flex flex-col gap-4 w-full text-sm md:text-base md:flex-row md:justify-between dark:text-zinc-100 text-zinc-700`}
            >
              <p className={`font-light `}>
              Copyright © 2024 E-Waste Mart All Rights Reserved.
              </p>
              <ul className="w-full flex justify-between md:w-fit gap-9">
                <li className="">Terms & Conditions </li>
                <li className=" ">Privacy Policy</li>
              </ul>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Footer1;