import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Recyclers", href: "/recyclers" },
      { label: "Partners", href: "/collaborators" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about-us" },
      { label: "Create account", href: "/register" },
      { label: "Login", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "support@ewastemart.com", href: "mailto:support@ewastemart.com" },
      { label: "Data safe recycling", href: "/about-us" },
      { label: "Responsible disposal", href: "/about-us" },
    ],
  },
];

export default function Footer1() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" width={42} height={42} className="h-10 w-10" alt="E-WasteMart logo" />
            <span className="text-xl font-bold text-gray-950 dark:text-white">E-WasteMart</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
            A role-based marketplace for e-waste sellers, recyclers and enterprise take-back programmes.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="font-semibold text-gray-950 dark:text-white">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link className="text-sm text-gray-600 hover:text-primary dark:text-gray-300" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
        <p>Copyright 2026 E-WasteMart. All rights reserved.</p>
        <p>Built for transparent, responsible e-waste movement.</p>
      </div>
    </footer>
  );
}
