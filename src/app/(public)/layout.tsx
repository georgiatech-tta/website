// ponytail: force-dynamic so all public pages run at request time (DB not available at build)
export const dynamic = "force-dynamic";

import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <ScrollReveal>{children}</ScrollReveal>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
