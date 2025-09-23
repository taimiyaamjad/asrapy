
import { Code2, Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472h-15.08c-1.356 0-2.46-1.104-2.46-2.472v-19.056c0-1.368 1.104-2.472 2.46-2.472h15.08zm-2.883 5.064s-.42-.516-.816-.96c-.444-.492-1.428-1.2-1.428-1.2s-.216.204-.384.384c-2.316-1.02-4.86-1.02-7.176 0-.168-.18-.384-.384-.384-.384s-.984.708-1.428 1.2c-.396.444-.816.96-.816.96s-2.088 2.22-2.616 5.868c0 0 .936 2.184 3.732 2.184 0 0 .612-.768.996-1.404-.42-.252-.78-.516-1.068-.816-1.284-1.284-1.284-2.736 0-4.02.036-.036.084-.072.12-.108.06-.048.108-.096.168-.144.132-.096.264-.192.408-.276.192-.12.396-.216.6-.3.12-.048.24-.096.372-.132.228-.072.456-.12.696-.156.12-.012.24-.024.36-.036.216-.012.432-.024.648-.024s.432.012.648.024c.12.012.24.024.36.036.24.036.468.084.696.156.132.036.252.084.372.132.204.084.408.18.6.3.144.084.276.18.408.276.06.048.108.096.168.144.036.036.084.072.12.108 1.284 1.284 1.284 2.736 0 4.02-.288.3-.648.564-1.068.816.384.636.996 1.404.996 1.404 2.796 0 3.732-2.184 3.732-2.184-.528-3.648-2.616-5.868-2.616-5.868zm-6.108 4.224c-.744 0-1.356-.612-1.356-1.356s.612-1.356 1.356-1.356c.744 0 1.356.612 1.356 1.356s-.612 1.356-1.356 1.356zm3.324 0c-.744 0-1.356-.612-1.356-1.356s.612-1.356 1.356-1.356c.744 0 1.356.612 1.356 1.356 0 .744-.612 1.356-1.356 1.356z" />
    </svg>
);


export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold text-primary">AsraPy</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AsraPy. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="#" aria-label="Twitter">
            <Twitter className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
          <Link href="#" aria-label="GitHub">
            <Github className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
          <Link href="#" aria-label="LinkedIn">
            <Linkedin className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
          <Link href="https://discord.gg/uwpmkn3YDN" aria-label="Discord">
            <DiscordIcon className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
