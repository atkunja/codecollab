export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const apiUrl = `http://localhost:3001/rooms/${id}`;
  try {
    const apiRes = await fetch(apiUrl, { method: "GET" });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status });
  } catch {
    console.error("proxy error");
    return new Response(
      JSON.stringify({ error: "Proxy error" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const apiUrl = `http://localhost:3001/rooms/${id}`;
  const body = await request.text();
  try {
    const apiRes = await fetch(apiUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status });
  } catch {
    console.error("proxy error");
    return new Response(
      JSON.stringify({ error: "Proxy error" }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const apiUrl = `http://localhost:3001/rooms/${id}`;
  const body = await request.text();
  try {
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: apiRes.status });
  } catch {
    console.error("proxy error");
    return new Response(
      JSON.stringify({ error: "Proxy error" }),
      { status: 500 }
    );
  }
}
