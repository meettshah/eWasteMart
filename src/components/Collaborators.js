"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

const collaborators = [
  { id: 1, name: "Samsung", logo: "/samsung.png", speciality: "Mobiles & Smart Appliances", impact: "Certified Take-Back & Refurbishment", process: "Diagnostics, circular material recovery, and compliant secondary channel routing." },
  { id: 2, name: "HP", logo: "/hp.png", speciality: "Laptops, Desktops & Printers", impact: "Closed-Loop IT Asset Recovery", process: "Automated component harvesting, closed-loop plastic recycling, and certified data erasure." },
  { id: 3, name: "Apple", logo: "/apple.png", speciality: "Premium Mobile & Tablet Hardware", impact: "Zero-Landfill Robotic Disassembly", process: "Daisy/Liam style robotic disassembly, rare earth magnet retrieval, and pure gold recycling." },
  { id: 4, name: "Dell", logo: "/dell.png", speciality: "Enterprise Servers & Workstations", impact: "Nationwide Corporate IT Asset Disposition", process: "Asset tagging, military-grade DOD drive wiping, and carbon credit offsets." },
  { id: 5, name: "LG", logo: "/lg.png", speciality: "Displays & High-Capacity Appliances", impact: "Refrigerant & Heavy Metal Safe Recovery", process: "Safe CFC recovery, leaded glass smelting, and circular copper extraction." },
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
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>Enterprise Circular Ecosystem</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Brand Partners & EPR Programmes
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Leading consumer electronics manufacturers operating extended producer responsibility (EPR) take-back pipelines and certified corporate recycling on eWasteMart.
              </p>
            </div>
            
            <Link
              href="/marketplace"
              className="btn-gradient shrink-0 text-xs"
            >
              Enter Bidding Floor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, hardware category or programme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 text-xs"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredCollaborators.length} verified partners
          </span>
        </div>

        {/* Partners Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCollaborators.map((collaborator) => (
            <article
              key={collaborator.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <Image
                      src={collaborator.logo}
                      alt={`${collaborator.name} logo`}
                      width={64}
                      height={64}
                      className="max-h-12 max-w-12 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {collaborator.name}
                      </h2>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500">{collaborator.speciality}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{collaborator.impact}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {collaborator.process}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800">
                CPCB EPR Registration Active • Tier-1 Partner
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
