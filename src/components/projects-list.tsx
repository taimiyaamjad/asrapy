"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects-data";
import { projectsData, allTechnologies } from "@/lib/projects-data";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";

type ProjectsListProps = {
  projects: Project[];
};

export function ProjectsList({ projects }: ProjectsListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.technologies.includes(activeFilter));

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <Button
          variant={activeFilter === "All" ? "default" : "outline"}
          onClick={() => setActiveFilter("All")}
          className="transition-all"
        >
          All
        </Button>
        {allTechnologies.map((tech) => (
          <Button
            key={tech}
            variant={activeFilter === tech ? "default" : "outline"}
            onClick={() => setActiveFilter(tech)}
            className="transition-all"
          >
            {tech}
          </Button>
        ))}
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground">No projects found for this category.</p>
        </div>
      )}
    </div>
  );
}
