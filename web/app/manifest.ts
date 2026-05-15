import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DOC-RENAME",
    short_name: "DOC-RENAME",
    description:
      "Renommage local de fichiers selon des conventions documentaires par metier.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAF7EE",
    theme_color: "#FAF7EE",
    lang: "fr",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "256x256",
        type: "image/x-icon",
      },
    ],
  };
}
