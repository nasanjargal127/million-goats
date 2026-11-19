import { Hero } from "@/components/home/hero";
import { LabTeaser, Manifesto, Schedule, Team } from "@/components/home/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Manifesto />
        <Team />
        <LabTeaser />
        <Schedule />
      </main>
      <SiteFooter />
    </>
  );
}
