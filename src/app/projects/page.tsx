import { projectsData } from "@/lib/projects-data";
import { ProjectsList } from "@/components/projects-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Our Work
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Explore a selection of our projects. Use the filters to navigate through different technologies.
        </p>
      </div>

      <ProjectsList projects={projectsData} />
      
      <div className="mt-24 text-center border-t pt-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Interested in Collaborating?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Check out our codebase or get in touch to discuss your next project.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-5 w-5" /> Visit GitHub
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/#contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
