"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@nextui-org/react";

export default function LandingNavbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav flex h-16 w-full items-center justify-between px-6">
      <div className="flex items-center">
        <Link className="flex items-center gap-3 text-inherit" href="/">
          <Image src="/logo.png" width={36} height={36} alt="E-WasteMart logo" />
          <span className="text-gradient font-bold">E-WasteMart</span>
        </Link>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <Link href="#how-it-works" className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200">How it works</Link>
        <Link href="#roles" className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200">Roles</Link>
        <Link href="/collaborators" className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200">Partners</Link>
        <Link href="/about-us" className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200">About</Link>
      </div>

      <div className="flex items-center gap-3">
        <Button as={Link} href="/login" variant="flat" color="primary" className="font-semibold">
          Login
        </Button>
        <Button as={Link} href="/register" color="primary" className="hidden font-semibold sm:inline-flex">
          Create account
        </Button>
      </div>
    </nav>
  );
}
