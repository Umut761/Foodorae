export const dynamic = "force-static"

export function GET() {
  const manifest = {
    name: "Foodorae — FreshMatch",
    short_name: "Foodorae",
    description:
      "Track your pantry, catch food before it expires, and match recipes to what you own.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#FAFAF7",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
