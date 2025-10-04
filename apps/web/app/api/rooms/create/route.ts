export async function POST(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: "API URL not configured" }),
      { status: 500 },
    );
  }
  const apiUrl = `${baseUrl}/rooms/create`;
  const body = await req.text();
  try {
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status });
  } catch {
    console.error("rooms/create proxy error");
    return new Response(
      JSON.stringify({ error: "Proxy error" }),
      { status: 500 }
    );
  }
}
