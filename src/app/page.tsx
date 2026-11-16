import { ChevronStrip } from "@/components/brand";
import { Hero } from "@/components/home/hero";
import { LabTeaser, Manifesto } from "@/components/home/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ChevronStrip id="mg-chevron-hero" />
        <Manifesto />
        <LabTeaser />
        <ChevronStrip id="mg-chevron-lab" variant="mixed" />
      </main>
      <SiteFooter />
    </>
  );
}
