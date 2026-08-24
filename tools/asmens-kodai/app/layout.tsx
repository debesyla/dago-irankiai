import type { Metadata } from "next";
import "./project.css";

const description = "Lietuviško asmens kodo generatorius ir validatorius.";

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
        <link rel="stylesheet" href="https://dago.lt/assets/styles/dago.css?v=20260808" />
      </head>
      <body>{children}</body>
    </html>
  );
}
