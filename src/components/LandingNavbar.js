"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { ThemeSwitch } from "./theme-switch";

const publicLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
  { label: "Partners", href: "/collaborators" },
  { label: "About", href: "/about-us" },
];

export default function LandingNavbar() {
  const pathname = usePathname();

  return (
    <Navbar maxWidth="xl" position="sticky" isBlurred className="border-b border-gray-200/70 dark:border-gray-800">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link className="flex items-center gap-3" href="/">
            <Image src="/logo.png" width={36} height={36} className="h-9 w-9" alt="E-WasteMart logo" />
            <span className="font-bold text-gray-950 dark:text-white">E-WasteMart</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-5 md:flex" justify="center">
        {publicLinks.map((item) => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <Link className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200" href={item.href}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <Button as={Link} href="/login" variant="flat" color="primary" className="font-semibold">
          Login
        </Button>
        <Button as={Link} href="/register" color="primary" className="hidden font-semibold sm:inline-flex">
          Create account
        </Button>
      </NavbarContent>
    </Navbar>
  );
}
