export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  imageHint: string;
  projectUrl?: string;
  codeUrl?: string;
};

export const projectsData: Project[] = [];

export const allTechnologies = Array.from(
  new Set(projectsData.flatMap((p) => p.technologies))
).sort();
