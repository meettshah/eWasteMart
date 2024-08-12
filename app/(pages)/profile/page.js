"use client";
import ProfileFooter from '@/components/ProfileFooter';
import ProfileHeader from '@/components/ProfileHeader';
import RecyclerProfile from '@/components/RecyclerProfile';
import UserProfile from '@/components/UserProfile';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useSession } from 'next-auth/react';
import RecyclerForm from '@/components/RecyclerForm';

const Page = () => {
  const { data: session } = useSession();
  const { user, loading, error, fetchUserById } = useUser();

  // Accessing the user's email from the session object
  const userEmail = session?.user?.email;
  console.log("User Email:", userEmail);

  // useEffect(() => {
  //   if (session && !user) {
  //     fetchUserById(session?.user?.email); // Assuming fetchUserById requires the user's ID
  //   }
  // }, [session]);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <ProfileHeader />
      {session?.user?.role === "user" && <UserProfile />}
      {session?.user?.role === "recycler" && <RecyclerProfile />}
      {session?.user?.role === "recycler" && <RecyclerForm />}
      <ProfileFooter />
    </div>
  );
}

export default Page;
