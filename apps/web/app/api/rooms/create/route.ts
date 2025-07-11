export async function POST(req: Request) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/rooms/create`;
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
