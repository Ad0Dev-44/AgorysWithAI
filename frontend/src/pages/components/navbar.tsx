"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import  Logo  from "@/components/landing/logo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Insights", href: "#insights" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* LOGO */}
        <Link href="/">
          <Logo />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-8 md:flex">
          {pathname === "/" &&
            navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/register">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Button>
          </Link>

          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline">Sign in</Button>
              </Link>

              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}