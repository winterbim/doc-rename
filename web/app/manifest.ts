import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BIMCHECK-Rename",
    short_name: "BimDoc",
    description:
      "Renommer vos livrables BIM (ISO 19650 / SIA) avant dépôt CDE, en local navigateur.",
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
