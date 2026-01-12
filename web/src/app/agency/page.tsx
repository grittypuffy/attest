"use client";

import {
  Briefcase,
  FileText,
  TrendUp,
  Wallet,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";

const STATS = [
  {
    label: "Active Projects",
    value: "12",
    icon: <Briefcase size={24} weight="duotone" />,
    change: "+2 this month",
    trend: "up",
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Pending Proposals",
    value: "5",
    icon: <FileText size={24} weight="duotone" />,
    change: "3 reviewing",
    trend: "neutral",
    color: "bg-amber-100 text-amber-600",
  },
  {
    label: "Total Budget",
    value: "$4.2M",
    icon: <Wallet size={24} weight="duotone" />,
    change: "+12% vs last year",
    trend: "up",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Completion Rate",
    value: "94%",
    icon: <TrendUp size={24} weight="duotone" />,
    change: "+1.5% improvement",
    trend: "up",
    color: "bg-purple-100 text-purple-600",
  },
];

const RECENT_PROJECTS = [
  {
    name: "Urban Park Renovation",
    status: "In Progress",
    date: "Oct 24, 2024",
    statusColor: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  {
    name: "City Library Extension",
    status: "Review",
    date: "Oct 22, 2024",
    statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  {
    name: "Downtown Road Repair",
    status: "Completed",
    date: "Oct 15, 2024",
    statusColor: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  {
    name: "Community Center HVAC",
    status: "In Progress",
    date: "Oct 10, 2024",
    statusColor: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
];

export default function AgencyDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
          Overview
        </h2>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          Welcome back,{" "}
          <span className="font-semibold text-gray-900">
            BuildRight Construction
          </span>
          . Here's a summary of your ongoing projects and proposals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-3 ${stat.color}`}>{stat.icon}</div>
              {stat.trend === "up" && (
                <span className="inline-flex items-baseline rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 md:mt-2 lg:mt-0">
                  <TrendUp
                    className="-ml-1 mr-0.5 h-3.5 w-3.5 flex-shrink-0 self-center text-green-500"
                    weight="bold"
                  />
                  Trending
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-xs text-gray-400">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Recent Projects
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                View all <ArrowRight size={16} />
              </button>
            </div>
            <div className="flow-root">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Project Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {RECENT_PROJECTS.map((project) => (
                      <tr
                        key={project.name}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {project.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${project.statusColor}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            {project.date}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Sidebar Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full group flex items-center justify-between rounded-lg border border-gray-200 p-4 text-left hover:border-blue-300 hover:ring-1 hover:ring-blue-300 transition-all bg-white hover:bg-blue-50/50">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                    Create New Proposal
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Submit a bid for a new project
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="text-lg font-bold">+</span>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FileText size={20} />
                </div>
                View Performance Reports
              </button>

              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                  <Clock size={20} />
                </div>
                Update Agency Profile
              </button>
            </div>
          </div>

          {/* Notifications Placeholder */}
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-md">
            <h3 className="text-lg font-bold mb-2">New Compliance Rule</h3>
            <p className="text-blue-100 text-sm mb-4">
              All agencies must update their safety certification by next
              Monday.
            </p>
            <button className="text-xs font-semibold bg-white text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Review Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
