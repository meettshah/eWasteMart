"use client";
import RecyclerProfile from '@/components/RecyclerProfile';
import UserProfile from '@/components/UserProfile';
import React from 'react'

const page = () => {
  return (
    <div>
      <UserProfile/>
      <RecyclerProfile/>
    </div>
  )
}

export default page
