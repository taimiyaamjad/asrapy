import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Code, Bot, Rocket, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-bg');

const features = [
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "Innovative Solutions",
    description: "We build cutting-edge applications that push the boundaries of technology.",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI Integration",
    description: "Leveraging artificial intelligence to create smart, efficient, and powerful tools.",
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: "Clean Code",
    description: "Focus on writing maintainable, scalable, and high-quality code.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Reliable & Secure",
    description: "Building robust and secure systems you can trust.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h1 className="animate-fade-in-up font-headline text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
            AsraPy
          </h1>
          <p className="mt-4 max-w-2xl font-headline text-lg md:text-2xl text-muted-foreground animate-fade-in-up animation-delay-300">
            Coding Beyond Imagination
          </p>
          <div className="mt-8 flex gap-4 animate-fade-in-up animation-delay-600">
            <Button asChild size="lg" className="transition-transform hover:scale-105">
              <Link href="/projects">View Projects</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="transition-transform hover:scale-105">
              <Link href="#contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                About AsraPy
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our mission is to craft exceptional digital experiences through clean code and innovative thinking. We specialize in building robust and scalable web applications that solve real-world problems.
              </p>
              <p className="mt-4 text-muted-foreground">
                What makes us unique is our passion for leveraging the latest technologies, including AI, to deliver solutions that are not just functional but also intelligent and future-proof.
              </p>
              <div className="mt-6">
                <h3 className="font-headline text-lg font-semibold text-foreground">Core Technologies</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Next.js</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">React</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">TypeScript</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Python</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">GenAI</span>
                </div>
              </div>
            </div>
            <div className="w-full h-80 rounded-lg bg-muted flex items-center justify-center">
              <Code className="w-32 h-32 text-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Why Choose AsraPy?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              We provide tangible benefits that translate into success for your projects.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6 bg-card hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-headline text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Let's Build Together
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Have a project in mind or want to collaborate? Send a message.
            </p>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <form className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Name" />
                    <Input type="email" placeholder="Email" />
                  </div>
                  <Textarea placeholder="Your message" rows={5} />
                  <Button type="submit" size="lg" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
