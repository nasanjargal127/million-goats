import type { Metadata } from "next";
import { LabExperience } from "@/components/lab/lab-experience";

const description =
  "Million Goats Trading Lab — 4 танхим, 100 суудал. 3D танхимаас суудлаа сонгож захиалаарай. 4 rooms, 100 seats, $1,500 per seat.";

export const metadata: Metadata = {
  title: "Trading Lab",
  description,
  alternates: { canonical: "/lab" },
  openGraph: { title: "Million Goats Trading Lab", description },
  twitter: { title: "Million Goats Trading Lab", description },
};

export default function LabPage() {
  return <LabExperience />;
}
