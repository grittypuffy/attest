"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Folder } from "@phosphor-icons/react/dist/ssr";

interface Project {
  project_id: string;
  project_name: string;
  description: string;
}

export default function ProposalsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await api.project.all.get();
        if (data && !error && data.data) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Review Proposals
      </h1>
      <p className="text-gray-600 mb-8">
        Select a project to review submitted proposals from agencies.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.project_id}
              href={`/government/proposals/${project.project_id}`}
              className="block group"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center mb-4 text-blue-600">
                  <Folder size={24} weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.project_name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-600">
                  View Proposals &rarr;
                </div>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No projects found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
