"use client"
import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button} from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AuthModal from "./AuthModal";
// import { useSession } from "next-auth/react";

export default function Nav() {
  // const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();


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
            {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href} isActive={(pathname === item.href) ? 1: 0}>
                <NextLink
                    className={`  ${ (pathname === item.href) ? 'text-primary' : 'text-black dark:text-white font-semibold '}`}
                    href={item.href}
                >
                    {item.label}
                </NextLink>
                </NavbarItem>
            ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <Link className=""></Link>
        </NavbarItem>
        <ThemeSwitch />
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>
      <NavbarMenu>
        {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
                <NextLink
                color={
                    (index === 2) ? "primary" : (index === siteConfig.navMenuItems.length - 1) ? "primary" : "foreground"
                }
                className={`w-full ${(pathname === item.href) ? "text-primary font-semibold": ""}`}
                href={item.href}
                size="lg"
                >
                {item.label}
                </NextLink>
            </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <AuthModal />
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
