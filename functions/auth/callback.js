export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  return Response.redirect(new URL("/admin", request.url).href, 302);
}
