"use client";

import {
  Briefcase,
  FileText,
  TrendUp,
  Wallet,
  Clock,
  ArrowRight,
  FilePlus,
  CheckCircleIcon,
  UsersThree,
} from "@phosphor-icons/react";
import Link from "next/link";


export default function AgencyDashboard() {
  return (
    <div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <FilePlus size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Explore Project
          </h3>
          <p className="text-gray-500 text-sm mb-4">
             Browse active government projects open for agencies to review, apply, and participate in.
          </p>
          <Link
            href="/projects"
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Browse New Project &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <CheckCircleIcon size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Track Proposals
          </h3>
          <p className="text-gray-500 text-sm mb-4">
              Track all proposals you’ve submitted, their approval status, and upcoming project phases.
          </p>
          <Link
            href="/agency/proposals"
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Track Proposals &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <UsersThree size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Agency Management
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            View list of agencies in the field
          </p>
          <Link
            href="/agencies"
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            View Agencies &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
