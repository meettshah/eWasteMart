"use client";
import ProfileFooter from '@/components/ProfileFooter';
import ProfileHeader from '@/components/ProfileHeader';
import RecyclerProfile from '@/components/RecyclerProfile';
import UserProfile from '@/components/UserProfile';
import React from 'react'

const page = () => {
  
  
  return (
    <div>
      <ProfileHeader/>
      <UserProfile/>
      <RecyclerProfile/>
      <ProfileFooter/>
    </div>
  )
}

export default page
