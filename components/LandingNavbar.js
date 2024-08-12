"use client";
import React, { useState } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { ThemeSwitch } from "./theme-switch";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Payment from "./Payment";

export default function LandingNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();


    return (
        <Navbar maxWidth="xl" position="sticky" isBlurred={false} onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent justify="start">
                <NavbarBrand>
                    <Link className="flex justify-center items-center" href="/">
                        <Image
                            src={'/logo.png'}
                            width={36}
                            height={36}
                            className="h-8 w-8 mr-4"
                            alt="logo"
                        />
                        <p className="font-bold text-inherit">E-WasteMart</p>
                    </Link>
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">

            </NavbarContent>

            <NavbarContent justify="end">
                <Payment existingName={"KANISHK"} existingEmail={"kanishkchaudhary2005@gmail.com"} existingAmount={200} />
                <ThemeSwitch />
                <Link className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-success" href="/login">Login</Link>
                <Link className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-success" href="/register">Register</Link>
            </NavbarContent>
            <NavbarMenu>

                <NavbarMenuItem key="auth-modal">
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
