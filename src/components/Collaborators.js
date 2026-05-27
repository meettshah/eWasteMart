"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const collaborators = [
  { id: 1, name: "Samsung", logo: "/samsung.png", speciality: "Mobiles and appliances", impact: "Take-back and refurbishment programmes", process: "Samsung-style programmes focus on collection, diagnostics, material recovery and safe channel routing." },
  { id: 2, name: "HP", logo: "/hp.png", speciality: "Computers and printers", impact: "IT asset recovery", process: "HP-style recovery emphasizes device sorting, component reuse and plastics recovery for responsible circularity." },
  { id: 3, name: "Apple", logo: "/apple.png", speciality: "Mobile devices", impact: "Closed-loop material recovery", process: "Apple-style recovery prioritizes secure handling, device disassembly and high-value material extraction." },
  { id: 4, name: "Dell", logo: "/dell.png", speciality: "Laptops and enterprise IT", impact: "Enterprise take-back", process: "Dell-style programmes support business collections, asset tracking and plastics or metals recovery." },
  { id: 5, name: "LG", logo: "/lg.png", speciality: "Home appliances", impact: "Appliance recycling", process: "LG-style recycling includes collection, dismantling, sorting and channeling materials to certified processors." },
];

export default function CollaboratorsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCollaborators = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return collaborators.filter((collaborator) =>
      collaborator.name.toLowerCase().includes(term) ||
      collaborator.speciality.toLowerCase().includes(term) ||
      collaborator.impact.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Enterprise programmes</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-950 dark:text-white">Partners and brand-led recycling</h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
              Explore example enterprise recycling programmes that can participate in E-WasteMart as buyers, sellers or take-back operators.
            </p>
          </div>
          <Link href="/marketplace" className="rounded-md bg-primary px-5 py-3 text-center font-semibold text-white">
            Open marketplace
          </Link>
        </section>

        <div className="mt-8 max-w-md">
          <input
            type="search"
            placeholder="Search by company, category or programme"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full"
          />
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCollaborators.map((collaborator) => (
            <article key={collaborator.id} className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <Image src={collaborator.logo} alt={`${collaborator.name} logo`} width={72} height={72} className="h-16 w-16 rounded-md object-contain" />
                <div>
                  <h2 className="text-xl font-bold text-gray-950 dark:text-white">{collaborator.name}</h2>
                  <p className="text-sm text-gray-500">{collaborator.speciality}</p>
                </div>
              </div>
              <div className="mt-5 rounded-md bg-gray-50 p-4 dark:bg-gray-950">
                <p className="text-sm font-semibold text-gray-950 dark:text-white">{collaborator.impact}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{collaborator.process}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
