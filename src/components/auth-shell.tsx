import Image from "next/image";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { site } from "@/lib/site";
import { BrandDot } from "./brand";
import { HeroBackdrop } from "./home/hero-backdrop";

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
      <section className="relative isolate hidden min-w-0 flex-[1_1_480px] flex-col justify-between overflow-hidden bg-mg-navy p-12 text-white lg:flex">
        <HeroBackdrop />
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
        <p className="relative m-0 font-bold text-[clamp(40px,4vw,64px)] uppercase leading-[0.92] tracking-[-0.02em] [text-shadow:0_8px_40px_rgba(1,13,38,0.55)]">
          <span className="block">
            One community
            <BrandDot />
          </span>
          <span className="block">
            A million goals
            <BrandDot />
          </span>
        </p>
        <p className="relative m-0 max-w-sm text-white/85">
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
            <h1 className="m-0 font-bold text-[32px] uppercase leading-tight tracking-[-0.01em]">
              {title}
              <BrandDot />
            </h1>
            <p className="m-0 text-mg-body">{subtitle}</p>
          </div>
          {/* The form reads ?next= from the URL, which needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-80" />}>{children}</Suspense>
        </div>
      </section>
    </main>
  );
}
