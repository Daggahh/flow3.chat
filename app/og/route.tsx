export const runtime = "edge";

export function GET() {
  return new Response(
    `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#2a201c"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="system-ui" font-size="64" fill="#e7e9df">
        Flow3.chat
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="system-ui" font-size="32" fill="#959c70">
        Advanced AI Chat Interface
      </text>
    </svg>
  `.trim(),
    {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
