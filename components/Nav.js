"use client";
import React, { useState } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AuthModal from "./AuthModal";
import { signOut } from "next-auth/react";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const profileImageUrl = "/profile1.png";

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <Navbar maxWidth="xl" position="sticky" isBlurred={false} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent justify="start">
        <NavbarBrand>
          <Image
            src={'/logo.png'}
            width={36}
            height={36}
            className="h-8 w-8 mr-4"
            alt="logo"
          />
          <p className="font-bold text-inherit">E-WasteMart</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {siteConfig.navItems.map((item, index) => (
          <NavbarItem key={item.href} isActive={(pathname === item.href) ? 1 : 0}>
            <NextLink
              className={` ${(pathname === item.href) ? 'text-primary' : 'text-black dark:text-white font-semibold '}`}
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <NavbarItem className="hidden sm:flex relative">
          <div className="relative">
            <Image
              src={profileImageUrl}
              width={38}
              height={38}
              className="rounded-full ml-4 cursor-pointer"
              alt="Profile"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 dark:bg-gray-900 bg-white shadow-lg rounded-md py-2 z-50">
                {[
                  { label: "Profile", href: "/profile" },
                  { label: "Settings", href: "/settingtab" },
                ].map((item, index) => (
                  <Link
                    key={index} 
                    href ={item.href}
                    className="block px-4 py-2 dark:text-white text-gray-800 dark:hover:bg-primary hover:bg-gray-100 cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ))}
                <button 
                  className="px-4 py-2 mx-4 rounded-md text-white bg-primary cursor-pointer"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>
      <NavbarMenu>
        {siteConfig.navMenuItems.map((item, index) => (
          <NavbarMenuItem key={index}> 
            <NextLink
              color={
                (index === 2) ? "primary" : (index === siteConfig.navMenuItems.length - 1) ? "primary" : "foreground"
              }
              className={`w-full ${(pathname === item.href) ? "text-primary font-semibold" : ""}`}
              href={item.href}
              size="lg"
            >
              {item.label}
            </NextLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem key="auth-modal"> {/* Added key prop here */}
          <AuthModal />
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
