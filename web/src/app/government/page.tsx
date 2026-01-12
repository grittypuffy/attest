import Link from "next/link";
import { FilePlus, UsersThree, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function GovernmentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <FilePlus size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Project</h3>
          <p className="text-gray-500 text-sm mb-4">
            Launch new government initiatives and projects for public bidding.
          </p>
          <Link 
            href="/government/projects/create" 
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Create New Project &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Proposals</h3>
          <p className="text-gray-500 text-sm mb-4">
            Review and approve project proposals submitted by agencies.
          </p>
          <Link 
            href="/government/proposals" 
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Review Proposals &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <UsersThree size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency Management</h3>
          <p className="text-gray-500 text-sm mb-4">
            Register and accredit new agencies to the platform.
          </p>
          <Link 
            href="/government/agencies/create" 
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Register Agency &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
