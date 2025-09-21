import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden bg-card h-full flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 w-full">
        <Image
          src={project.imageUrl}
          alt={project.name}
          fill
          className="object-cover"
          data-ai-hint={project.imageHint}
        />
        <div className="absolute top-3 left-3 bg-black/50 rounded-full p-1">
          <Image
            src="https://firebasestudio-hosting.web.app/images/_B_y8G-IA/AsraPy.jpeg"
            alt="AsraPy Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-headline text-lg font-semibold text-foreground">{project.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground flex-grow">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">{tech}</Badge>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {project.projectUrl && (
            <Button asChild variant="outline" size="sm" className="group/button">
              <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                View Project <ArrowUpRight className="h-4 w-4 ml-2 transition-transform group-hover/button:translate-x-1 group-hover/button:-translate-y-1" />
              </Link>
            </Button>
          )}
          {project.codeUrl && (
            <Button asChild variant="ghost" size="sm">
              <Link href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                View Code
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
