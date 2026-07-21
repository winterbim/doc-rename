import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BIMCHECK-Rename",
    short_name: "BIMCHECK",
    description:
      "Convention de nommage multi-métiers, local-first : BIM, juridique, finance, RH, santé, industrie, immobilier.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAF7EE",
    theme_color: "#FAF7EE",
    lang: "fr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "256x256",
        type: "image/x-icon",
      },
    ],
  };
}
