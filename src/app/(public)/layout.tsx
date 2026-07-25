// ponytail: force-dynamic so all public pages run at request time (DB not available at build)
export const dynamic = "force-dynamic";

import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
