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
    id: "zenflow",
    name: "ZenFlow",
    description: "A collaborative workspace for teams, inspired by Notion. Organize your projects, tasks, and documents in one place.",
    technologies: ["Next.js", "TypeScript", "Convex", "Tailwind CSS"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "productivity workspace",
    projectUrl: "https://zenflow-phi.vercel.app/"
  },
  {
    id: "zencloud",
    name: "ZenCloud",
    description: "A secure and reliable cloud storage solution. Store, share, and access your files from anywhere.",
    technologies: ["Next.js", "Firebase", "Stripe", "Tailwind CSS"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "cloud storage",
    projectUrl: "https://www.zencloud.fun/"
  },
  {
    id: "asra-tutor",
    name: "Asra-Tutor",
    description: "An AI-powered tutor to help you learn and understand complex topics. Personalized learning at your fingertips.",
    technologies: ["Next.js", "GenAI", "Stripe", "Shadcn UI"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "AI education",
    projectUrl: "https://asra-tutor.vercel.app/"
  },
  {
    id: "ai-harshika",
    name: "AI-Harshika",
    description: "An AI companion application, featuring a unique personality to chat and interact with.",
    technologies: ["Next.js", "GenAI", "Pinecone", "Shadcn UI"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "AI companion",
    projectUrl: "https://ai-harshika.vercel.app/"
  },
  {
    id: "taskify",
    name: "Taskify",
    description: "A powerful project management tool inspired by Trello. Organize your workflow with boards, lists, and cards.",
    technologies: ["Next.js", "Prisma", "MySQL", "Tailwind CSS"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "task management",
    projectUrl: "https://taskify-upgraded.vercel.app/"
  },
  {
    id: "azoya",
    name: "Azoya",
    description: "A modern e-commerce platform for selling digital and physical products. Sleek, fast, and user-friendly.",
    technologies: ["Next.js", "Stripe", "Payload CMS", "TypeScript"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "ecommerce store",
    projectUrl: "https://azoya.vercel.app/"
  },
  {
    id: "bsd-public-school",
    name: "BSD Public School",
    description: "A comprehensive website for a public school, providing information for students, parents, and staff.",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "school building",
    projectUrl: "https://bsdps.vercel.app/"
  },
  {
    id: "bsd-chat",
    name: "BSD Chat",
    description: "A real-time chat application for communities, enabling seamless communication and collaboration.",
    technologies: ["Next.js", "Socket.io", "Prisma", "Tailwind CSS"],
    imageUrl: "https://www.zencloud.fun/IMG_20250921_193347.png",
    imageHint: "chat bubbles",
    projectUrl: "https://bsd-chat.vercel.app/"
  }
];

export const allTechnologies = Array.from(
  new Set(projectsData.flatMap((p) => p.technologies))
).sort();
