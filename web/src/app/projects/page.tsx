"use client";

import { Funnel, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

type ProjectStatus = "PROPOSAL" | "ACTIVE" | "COMPLETED";

interface Project {
  project_id: string;
  project_name: string;
  description: string;
  // Fields to be populated or mocked until backend supports them
  department?: string;
  status?: ProjectStatus;
  budget?: string;
  date?: string;
  location?: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "ALL">(
    "ALL",
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);

  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter()
  
  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    try {
      const session = await api.auth.session.valid.get();

      if (!session.data?.data?.valid) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);

      const userRes = await api.auth.user.get();
      if (userRes.data?.success) {
        setUser(userRes.data.data);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

useEffect(() => {
  console.log("USER STATE:", user);
}, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await api.project.all.get();
        if (data && !error && data.data) {
          // Transform the API data to match the UI needs, mocking missing fields
          const mappedProjects: Project[] = data.data.map((p: any) => ({
            ...p,
            department: "Government", // Placeholder
            status: "ACTIVE", // Placeholder
            budget: "TBD", // Placeholder
            date: new Date().toISOString().split("T")[0], // Placeholder
            location: "National", // Placeholder
          }));
          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Projects</h1>
          <p className="text-gray-500 mt-1">
            Browse government initiatives and proposals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlass size={20} />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Funnel size={20} />
            </div>
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white w-full sm:w-auto appearance-none"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ProjectStatus | "ALL")
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="PROPOSAL">Proposals</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === "PROPOSAL"
                          ? "bg-purple-100 text-purple-800"
                          : project.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.department}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.project_name}
                  </h3>
                </div>
                <div className="text-right md:text-left">
                  <div className="text-2xl font-bold text-gray-900">
                    {project.budget}
                  </div>
                  <div className="text-sm text-gray-500">Budget</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center gap-1">
                  <span>📍 {project.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅 {project.date}</span>
                </div>
              </div>

            {isAuthenticated && user?.role === "Agency" && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => router.push("/proposal/create")}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  Create Proposal
                </button>
              </div>
            )}

            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                No projects found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
