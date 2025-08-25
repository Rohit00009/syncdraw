"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import {
  Pencil,
  Share2,
  Users2,
  Sparkles,
  Github,
  Download,
} from "lucide-react";
import Link from "next/link";

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-clip-text text-transparent animate-gradient">
                SYNCDRAW
              </span>
            </h1>
            <h3 className="text-primary block mt-2 transition-opacity duration-500 hover:opacity-80">
              Real Time Collaborative Whiteboard App{" "}
            </h3>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground transition-all duration-500 hover:text-foreground">
              Create, collaborate, and share beautiful diagrams and sketches
              with our intuitive drawing tool. No sign-up required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={"/signin"}>
                <Button
                  variant="primary"
                  size="lg"
                  className="h-12 px-6 glow-hover"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 glow-hover"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Share2 className="h-6 w-6 text-primary" />,
                title: "Real-time Collaboration",
                desc: "Work together with your team in real-time. Share your drawings instantly with a simple link.",
              },
              {
                icon: <Users2 className="h-6 w-6 text-primary" />,
                title: "Multiplayer Editing",
                desc: "Multiple users can edit the same canvas simultaneously. See who's drawing what in real-time.",
              },
              {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "Smart Drawing",
                desc: "Intelligent shape recognition and drawing assistance helps you create perfect diagrams.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 border-2 hover:border-green-400 transition-all duration-500 glow-hover"
                title=""
                href=""
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 
                    rounded-3xl p-8 sm:p-16 animate-gradient glow-hover"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start creating?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
                Join thousands of users who are already creating amazing
                diagrams and sketches.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-6 transition-transform duration-300 hover:scale-105"
                >
                  Open Canvas
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 bg-transparent text-white border-white 
                       transition-all duration-300 hover:bg-white hover:text-green-600 hover:scale-105"
                >
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background text-foreground">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div>
              <h3 className="text-xl font-bold">SyncDraw</h3>
              <p className="mt-4 text-sm text-muted-foreground">
                Draw, collaborate, and brainstorm in real time with your team.
              </p>
              <div className="mt-6 flex space-x-4">
                <a
                  href="https://github.com"
                  className="hover:text-primary transition"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary transition">
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold">Platform</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Plans & Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold">Stay Updated</h4>
              <p className="mt-4 text-sm text-muted-foreground">
                Subscribe to our newsletter for updates & features.
              </p>
              <form className="mt-6 flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-l-xl border border-muted-foreground bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-r-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 SyncDraw. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-primary">
                Terms
              </a>
              <a href="#" className="hover:text-primary">
                Privacy
              </a>
              <a href="#" className="hover:text-primary">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
