"use client";

import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";

const roleLabels = {
  user: "Individual seller",
  bulk_seller: "Bulk seller",
  recycler: "Recycler",
  enterprise: "Enterprise",
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Navbar maxWidth="xl" position="sticky" isBlurred className="border-b border-gray-200/70 dark:border-gray-800">
      <NavbarContent justify="start">
        <NavbarBrand>
          <NextLink href="/home" className="flex items-center gap-3">
            <Image src="/logo.png" width={36} height={36} className="h-9 w-9" alt="E-WasteMart logo" />
            <span className="font-bold text-gray-950 dark:text-white">E-WasteMart</span>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-5 lg:flex" justify="center">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <NextLink
              className={`text-sm font-medium ${
                pathname === item.href ? "text-primary" : "text-gray-700 hover:text-primary dark:text-gray-200"
              }`}
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-900">
              <Avatar size="sm" src="/profile1.png" name={user?.name || "User"} />
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-gray-950 dark:text-white">{user?.name || "Account"}</span>
                <span className="block text-xs text-gray-500">{roleLabels[user?.role] || "Member"}</span>
              </span>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Account menu">
            <DropdownItem key="profile" href="/profile">Profile</DropdownItem>
            <DropdownItem key="settings" href="/settingtab">Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={() => signOut({ callbackUrl: "/" })}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <NavbarMenuToggle className="lg:hidden" />
      </NavbarContent>

      <NavbarMenu>
        {siteConfig.navMenuItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <NextLink className={pathname === item.href ? "font-semibold text-primary" : "text-gray-800 dark:text-gray-100"} href={item.href}>
              {item.label}
            </NextLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
