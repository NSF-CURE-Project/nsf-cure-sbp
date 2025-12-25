"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30 text-sm text-muted-foreground">
      <div className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:justify-items-center">
        {/* 🧭 Site links */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Explore</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/classes" className="hover:underline">Classes</Link></li>
            <li><Link href="/directory" className="hover:underline">Directory</Link></li>
          </ul>
        </div>

        {/* 📚 Resources */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Resources</h3>
          <ul className="space-y-2">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>

        {/* 🧑‍💻 Contact / Branding */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Connect</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:cnsfcuresbp@gmail.com"
                className="hover:underline"
              >
                nsfcuresbp@gmail.com
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
          <div className="mt-8 text-center text-xs text-muted-foreground/80">
            <p>
              © {new Date().getFullYear()} Cal Poly Pomona Engineering — NSF CURE Summer Bridge Program
            </p>
            <p className="mt-1">
              Built with ❤️ using Next.js, Tailwind CSS, and Payload.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
