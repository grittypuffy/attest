"use client";

import {
  CheckCircle,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Agency {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isAccredited: boolean;
  specialization: string[];
  location: string;
  completedProjects: number;
  description: string;
}

export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const { data, error } = await api.agency.all.get();
        if (data && !error && data.success) {
          setAgencies(data.data as any[]);
        }
      } catch (err) {
        console.error("Failed to fetch agencies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.specialization.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Accredited Agencies
        </h1>
        <p className="text-gray-600 mb-8">
          Search for verified agencies to partner with on government projects.
          Check their credentials, ratings, and past performance.
        </p>

        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <MagnifyingGlass size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by name or specialization..."
            className="pl-11 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                  {agency.name}
                </h3>
                {agency.isAccredited && (
                  <div className="text-blue-600" title="Accredited Agency">
                    <CheckCircle size={24} weight="fill" />
                  </div>
                )}
              </div>

              <div className="flex items-center mb-4">
                <Star weight="fill" className="text-yellow-400 mr-1" />
                <span className="font-semibold text-gray-900 mr-1">
                  {agency.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({agency.reviewCount} reviews)
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                {agency.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {agency.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">{agency.location}</span>
                <span className="font-medium text-gray-900">
                  {agency.completedProjects} Projects
                </span>
              </div>
            </div>
          ))}

          {filteredAgencies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                No agencies found matching "{searchTerm}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
