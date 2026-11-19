import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { LabTeaser, Manifesto, Schedule, Team } from "@/components/home/sections";
import { SectionGoat } from "@/components/motion/goat-backdrop";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: { absolute: site.homeTitle },
  description: site.description,
});

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Manifesto />
        {/* One navy run with the goat drawn behind it */}
        <div className="relative isolate bg-mg-navy">
          <SectionGoat />
          <Team />
          <LabTeaser />
          <Schedule />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
