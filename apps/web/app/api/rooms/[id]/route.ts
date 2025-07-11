import type { NextRequest } from "next/server";

function getIdFromPath(pathname: string): string | null {
  const parts = pathname.split("/");
  return parts.length ? parts[parts.length - 1] : null;
}

export async function GET(request: NextRequest) {
  const id = getIdFromPath(request.nextUrl.pathname);
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing id parameter" }),
      { status: 400 }
    );
  }

  const apiUrl = `http://localhost:3001/rooms/${id}`;
  try {
    const apiRes = await fetch(apiUrl);
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

export async function DELETE(request: NextRequest) {
  const id = getIdFromPath(request.nextUrl.pathname);
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing id parameter" }),
      { status: 400 }
    );
  }

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

export async function POST(request: NextRequest) {
  const id = getIdFromPath(request.nextUrl.pathname);
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing id parameter" }),
      { status: 400 }
    );
  }

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
