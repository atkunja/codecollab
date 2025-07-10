

export async function POST(req: Request) {
  const apiUrl = `http://localhost:3001/rooms/create`;
  const body = await req.text();
  try {
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy error" }), { status: 500 });
  }
}
