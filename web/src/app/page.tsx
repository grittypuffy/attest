import Link from "next/link";
import { ArrowRight, Buildings, Scroll } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          Transparent Government <span className="text-blue-600">Attestation</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          Empowering citizens to monitor government projects and proposals.
          Verify progress, search for accredited agencies, and ensure accountability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View Projects
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/agencies"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Find Agencies
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
            <Scroll className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Public Projects</h2>
          <p className="text-gray-600 mb-6">
            Browse through active and completed government projects. Review proposals, 
            timelines, and budget allocations to stay informed about public spending.
          </p>
          <Link href="/projects" className="text-blue-600 font-medium hover:underline">
            Browse Projects &rarr;
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600">
            <Buildings className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Agency Search</h2>
          <p className="text-gray-600 mb-6">
            Find and verify accredited agencies responsible for executing government works. 
            Check their track records, ratings, and current assignments.
          </p>
          <Link href="/agencies" className="text-blue-600 font-medium hover:underline">
            Search Agencies &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}