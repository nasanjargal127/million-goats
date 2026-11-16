import Image from "next/image";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { site } from "@/lib/site";
import { HighlightTitle } from "./brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-wrap bg-white">
      <section className="relative hidden min-w-0 flex-[1_1_480px] flex-col justify-between overflow-hidden bg-mg-navy p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-40 h-95 w-190 bg-linear-to-r from-mg-blue/0 to-mg-blue [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-40 bottom-0 h-60 w-130 bg-linear-to-r from-mg-orange/0 to-mg-orange [clip-path:polygon(0_0,50%_0,100%_100%,50%_100%)]"
        />
        <Link href="/" aria-label={`${site.name} нүүр`} className="relative self-start">
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <HighlightTitle
          as="p"
          className="relative text-[clamp(40px,4vw,64px)]"
          lines={[
            { text: "One community.", className: "bg-white text-mg-navy" },
            { text: "A million goals.", className: "bg-mg-orange text-mg-navy", indent: true },
          ]}
        />
        <p className="relative m-0 max-w-sm text-white/75">
          Суудлаа захиалж, QPay-ээр төлөөд баталгаажуулаарай.
        </p>
      </section>

      <section className="flex min-w-0 flex-[1_1_420px] flex-col justify-center px-4 py-12 sm:px-12">
        <div className="mx-auto flex w-full max-w-105 flex-col gap-8">
          <Link href="/" aria-label={`${site.name} нүүр`} className="self-start lg:hidden">
            <Image
              src={site.logos.horizontalOnLight}
              alt={site.name}
              width={1200}
              height={332}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-black text-[32px] uppercase leading-tight">{title}</h1>
            <p className="m-0 text-mg-body">{subtitle}</p>
          </div>
          {/* The form reads ?next= from the URL, which needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-80" />}>{children}</Suspense>
        </div>
      </section>
    </main>
  );
}
