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

export const projectsData: Project[] = [
  {
    id: "project-1",
    name: "AI-Powered Code Assistant",
    description: "An intelligent tool that assists developers with code generation, debugging, and optimization using advanced AI models.",
    technologies: ["Next.js", "GenAI", "TypeScript"],
    imageUrl: "https://picsum.photos/seed/project-1/600/400",
    imageHint: "tech project",
    projectUrl: "#",
    codeUrl: "#",
  },
  {
    id: "project-2",
    name: "Real-time Data Dashboard",
    description: "A dynamic dashboard for visualizing complex datasets in real-time, enabling data-driven decision making.",
    technologies: ["React", "D3.js", "WebSocket"],
    imageUrl: "https://picsum.photos/seed/project-2/600/400",
    imageHint: "data visualization",
    projectUrl: "#",
    codeUrl: "#",
  },
  {
    id: "project-3",
    name: "E-Commerce Platform",
    description: "A scalable and feature-rich e-commerce solution with a modern user experience and robust backend.",
    technologies: ["Next.js", "Stripe", "PostgreSQL"],
    imageUrl: "https://picsum.photos/seed/project-3/600/400",
    imageHint: "mobile app",
    projectUrl: "#",
    codeUrl: "#",
  },
  {
    id: "project-4",
    name: "Project Management Tool",
    description: "A collaborative platform for teams to manage tasks, track progress, and communicate effectively.",
    technologies: ["React", "Node.js", "Python"],
    imageUrl: "https://picsum.photos/seed/project-4/600/400",
    imageHint: "web application",
    projectUrl: "#",
    codeUrl: "#",
  },
];

export const allTechnologies = Array.from(
  new Set(projectsData.flatMap((p) => p.technologies))
).sort();
