import { ChevronStrip } from "@/components/brand";
import { Hero } from "@/components/home/hero";
import {
  AnalysisPreview,
  Join,
  LiveSessions,
  Manifesto,
  Services,
} from "@/components/home/sections";
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
        <Services />
        <LiveSessions />
        <AnalysisPreview />
        <Join />
      </main>
      <SiteFooter />
    </>
  );
}
