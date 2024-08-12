"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";



export default function Providers({ children, themeProps }) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <SessionProvider>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </SessionProvider>
    </NextUIProvider>
  );
}
