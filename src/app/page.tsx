import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
        <Link href="/" aria-label={`${site.name} home`}>
          <Image
            src={site.logos.horizontalOnLight}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="hidden h-9 w-auto dark:block"
          />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
        <h1 className="sr-only">{site.name}</h1>
        <Image
          src={site.logos.stackedOnLight}
          alt=""
          width={1200}
          height={681}
          priority
          className="w-full max-w-md dark:hidden"
        />
        <Image
          src={site.logos.stackedOnDark}
          alt=""
          width={1200}
          height={681}
          priority
          className="hidden w-full max-w-md dark:block"
        />
        <p className="max-w-xl text-lg text-foreground/70">{site.description}</p>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-foreground/60">
        © {site.name}
      </footer>
    </div>
  );
}
