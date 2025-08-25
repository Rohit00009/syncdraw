"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Share2, Users2, Sparkles, Github, Download } from "lucide-react";
import Link from "next/link";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-50 px-4">
        <div
          className="mx-auto flex max-w-7xl items-center justify-between 
          px-6 py-3 mt-2 rounded-2xl
          bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">SyncDraw</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-white/80">
            <a href="#features" className="hover:text-green-400 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-green-400 transition">
              Pricing
            </a>
            <a href="#docs" className="hover:text-green-400 transition">
              Docs
            </a>
            <a href="#blog" className="hover:text-green-400 transition">
              Blog
            </a>
          </div>

          {/* CTA */}
          <div className="hidden sm:flex">
            <Link href="/signup">
              <Button className="rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white px-5 py-2 shadow-md hover:scale-105 transition-transform">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 mt-32 md:mt-40">
        <h1 className="text-4xl md:text-6xl font-bold">
          <span className="bg-gradient-to-r from-green-300 via-green-500 to-green-300 bg-clip-text text-transparent animate-gradient">
            SYNCDRAW
          </span>
        </h1>

        <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
          Real Time Collaborative Whiteboard App <br />
          Create, collaborate, and share beautiful diagrams and sketches with
          our intuitive tool. No sign-up required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signin">
            <Button size="lg" className="h-12 px-6 glow-hover w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 glow-hover w-full sm:w-auto"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Share2 className="h-10 w-10 text-green-400" />,
                title: "Real-time Collaboration",
                desc: "Work together with your team in real-time. Share your drawings instantly with a simple link.",
              },
              {
                icon: <Users2 className="h-10 w-10 text-green-400" />,
                title: "Multiplayer Editing",
                desc: "Multiple users can edit the same canvas simultaneously. See who's drawing what in real-time.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-green-400" />,
                title: "Smart Drawing",
                desc: "Intelligent shape recognition and drawing assistance helps you create perfect diagrams.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-8 h-auto min-h-[260px] rounded-3xl 
                bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl 
                hover:border-green-400 hover:shadow-green-400/30 
                transition-all duration-500"
                title=""
                href=""
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 
            rounded-3xl p-8 md:p-16 animate-gradient glow-hover"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to start creating?
              </h2>
              <p className="mt-6 text-base md:text-lg text-white/80">
                Join thousands of users who are already creating amazing
                diagrams and sketches.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-6 hover:scale-105 transition-transform"
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

      {/* FOOTER */}
      <footer className="border-t bg-background text-foreground">
        <div className="container mx-auto px-6 lg:px-12 py-16">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
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
                  <a href="#" className="hover:text-primary">
                    Plans & Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
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
                  <a href="#" className="hover:text-primary">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
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
              <form className="mt-6 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-xl border border-muted-foreground bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Row */}
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
