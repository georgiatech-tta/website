import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--gt-navy)] text-white/70 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-white font-semibold">GT Table Tennis Association</p>
          <p>Georgia Institute of Technology · Atlanta, GA</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
