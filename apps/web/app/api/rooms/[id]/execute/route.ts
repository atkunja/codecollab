type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.INTERNAL_API_URL ||
    "http://localhost:3001";

  const body = await req.text();

  try {
    const apiRes = await fetch(`${baseUrl}/rooms/${id}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await apiRes.text();
    return new Response(data, {
      status: apiRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("rooms/execute proxy error", error);
    return new Response(JSON.stringify({ error: "Proxy error" }), { status: 500 });
  }
}
