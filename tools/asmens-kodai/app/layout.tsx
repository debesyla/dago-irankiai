import type { Metadata } from "next";
import "./project.css";

const description = "Lietuviško asmens kodo generatorius ir validatorius.";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lietuviško asmens kodo generatorius ir validatorius",
  alternateName: "Asmens kodai // dago",
  url: "https://dago.lt/irankiai/asmens-kodai/",
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  inLanguage: "lt",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  license: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
  codeRepository: "https://github.com/debesyla/asmens-kodai",
  image: "https://dago.lt/irankiai/asmens-kodai/og.png",
  author: {
    "@type": "Person",
    name: "Danielius Goriunovas",
    url: "https://dago.lt/",
  },
  featureList: [
    "Lietuviškų asmens kodų generavimas testavimui",
    "Asmens kodo struktūros, gimimo datos ir kontrolinio skaitmens tikrinimas",
    "JavaScript ir PHP validavimo pavyzdžiai",
  ],
};

export const metadata: Metadata = {
  title: "Asmens kodai // dago",
  description,
  metadataBase: new URL("https://dago.lt"),
  alternates: { canonical: "/irankiai/asmens-kodai/" },
  icons: { icon: "https://dago.lt/assets/img/dago-icon.png" },
  openGraph: {
    title: "Asmens kodai // dago",
    description,
    type: "website",
    url: "/irankiai/asmens-kodai/",
    images: [{
      url: "https://dago.lt/irankiai/asmens-kodai/og.png",
      width: 1729,
      height: 910,
      alt: "Asmens kodai // dago — generatorius ir validatorius",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asmens kodai // dago",
    description,
    images: ["https://dago.lt/irankiai/asmens-kodai/og.png"],
  },
  other: { "fediverse:creator": "@dago@river.group.lt" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <head>
        <meta name="theme-color" content="#222222" />
        <link rel="stylesheet" href="https://dago.lt/assets/styles/reset.css?v=20260808" />
        <link rel="stylesheet" href="https://dago.lt/assets/styles/dago.css?v=20260901" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
