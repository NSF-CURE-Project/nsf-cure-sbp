"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/70 backdrop-blur py-10 mt-12 text-sm text-muted-foreground">
      <div className="w-full px-6 sm:px-10 lg:px-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* 🧭 Site links */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Explore</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/classes" className="hover:underline">Classes</Link></li>
          </ul>
        </div>

        {/* 📚 Resources */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Resources</h3>
          <ul className="space-y-2">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/contacts" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>

        {/* 🧑‍💻 Contact / Branding */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Connect</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:cure@cpp.edu"
                className="hover:underline"
              >
                cure@cpp.edu
              </a>
            </li>
            <li>3801 W Temple Ave, Pomona, CA 91768</li>
            <li>
              <a
                href="https://www.cpp.edu/engineering/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                College of Engineering
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 🦶 Bottom bar */}
      <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground/80 px-6 sm:px-10 lg:px-12">
        <p>
          © {new Date().getFullYear()} Cal Poly Pomona Engineering — NSF CURE Summer Bridge Program
        </p>
        <p className="mt-1">
          Built with ❤️ using Next.js, Tailwind CSS, and Payload.
        </p>
      </div>
    </footer>
  );
}
