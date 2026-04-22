import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

const proxyToAPI = async (path: string, init?: RequestInit) => {
  const api = (cfEnv as { API?: { fetch: typeof fetch } }).API;
  if (!api) {
    return new Response(JSON.stringify({ error: 'API service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resp = await api.fetch(`https://api.xaostech.io${path}`, init);
    return resp;
  } catch (e: any) {
    console.error('API proxy error:', e);
    return new Response(JSON.stringify({ error: 'API proxy failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ url, locals }) => {
  const limit = url.searchParams.get('limit') || '50';
  const offset = url.searchParams.get('offset') || '0';
  const genre = url.searchParams.get('genre') || '';

  let path = `/music/trove?limit=${limit}&offset=${offset}`;
  if (genre) path += `&genre=${encodeURIComponent(genre)}`;

  return proxyToAPI(path);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.text();
  const cookies = request.headers.get('Cookie') || '';

  return proxyToAPI('/music/trove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies,
      'X-User-Id': user.id,
    },
    body,
  });
};
