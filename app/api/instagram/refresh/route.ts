import { NextResponse } from 'next/server';

// Rota protegida — só funciona com header Authorization correto.
// Chamar manualmente ou via cron quando necessário para renovar o token
// de longa duração do Instagram antes que ele expire.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  );
  const data = await res.json();

  // Logar o novo token para atualizar manualmente no .env
  console.log('NOVO TOKEN INSTAGRAM:', data.access_token);
  console.log('EXPIRA EM (segundos):', data.expires_in);

  return NextResponse.json({
    success: Boolean(data.access_token),
    expires_in: data.expires_in,
  });
}
