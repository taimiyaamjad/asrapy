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
  {
    id: "project-5",
    name: "ZenFlow",
    description: "A productivity app for managing tasks and workflows with a focus on mindfulness and clarity.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    imageUrl: "https://picsum.photos/seed/project-5/600/400",
    imageHint: "productivity tools",
    projectUrl: "https://zenflow-phi.vercel.app/",
  },
  {
    id: "project-6",
    name: "ZenCloud",
    description: "A secure and reliable cloud storage solution for personal and business use.",
    technologies: ["Next.js", "Firebase", "Stripe"],
    imageUrl: "https://picsum.photos/seed/project-6/600/400",
    imageHint: "cloud storage",
    projectUrl: "https://www.zencloud.fun/",
  },
  {
    id: "project-7",
    name: "Asra-Tutor",
    description: "An AI-powered tutoring platform offering personalized learning experiences.",
    technologies: ["Next.js", "GenAI", "OpenAI"],
    imageUrl: "https://picsum.photos/seed/project-7/600/400",
    imageHint: "AI learning",
    projectUrl: "https://asra-tutor.vercel.app/",
  },
  {
    id: "project-8",
    name: "AI-Harshika",
    description: "A personal AI assistant designed to help with daily tasks and information retrieval.",
    technologies: ["Next.js", "GenAI", "Clerk"],
    imageUrl: "https://picsum.photos/seed/project-8/600/400",
    imageHint: "AI assistant",
    projectUrl: "https://ai-harshika.vercel.app/",
  },
  {
    id: "project-9",
    name: "Taskify",
    description: "A powerful task management tool with collaboration features for teams.",
    technologies: ["Next.js", "Stripe", "Prisma"],
    imageUrl: "https://picsum.photos/seed/project-9/600/400",
    imageHint: "task management",
    projectUrl: "https://taskify-upgraded.vercel.app/",
  },
  {
    id: "project-10",
    name: "Azoya",
    description: "An e-commerce storefront for a modern fashion brand.",
    technologies: ["Next.js", "Stripe", "Sanity"],
    imageUrl: "https://picsum.photos/seed/project-10/600/400",
    imageHint: "fashion store",
    projectUrl: "https://azoya.vercel.app/",
  },
  {
    id: "project-11",
    name: "BSD Public School",
    description: "The official website for BSD Public School, providing information for students, parents, and staff.",
    technologies: ["Next.js", "Tailwind CSS"],
    imageUrl: "https://picsum.photos/seed/project-11/600/400",
    imageHint: "school website",
    projectUrl: "https://bsdps.vercel.app/",
  },
  {
    id: "project-12",
    name: "BSD Chat",
    description: "A real-time chat application for communities and teams.",
    technologies: ["Next.js", "Socket.io", "MySQL"],
    imageUrl: "https://picsum.photos/seed/project-12/600/400",
    imageHint: "chat application",
    projectUrl: "https://bsd-chat.vercel.app/",
  },
];

export const allTechnologies = Array.from(
  new Set(projectsData.flatMap((p) => p.technologies))
).sort();
