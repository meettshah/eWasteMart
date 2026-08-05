"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@nextui-org/react";

export default function LandingNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200/70 bg-white/70 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/70">
      <div className="flex items-center">
        <Link className="flex items-center gap-3 text-inherit" href="/">
          <Image src="/logo.png" width={36} height={36} alt="E-WasteMart logo" />
          <span className="font-bold text-gray-950 dark:text-white">E-WasteMart</span>
        </Link>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <Link href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">How it works</Link>
        <Link href="#roles" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">Roles</Link>
        <Link href="/collaborators" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">Partners</Link>
        <Link href="/about-us" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">About</Link>
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
