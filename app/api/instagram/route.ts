import { NextResponse } from 'next/server';

type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

type InstagramMediaRaw = {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

export type InstagramPost = {
  id: string;
  caption: string;
  media_type: InstagramMediaType;
  media_url: string;
  permalink: string;
  timestamp: string;
};

export async function GET() {
  try {
    // O token configurado é um token de System User (Meta Business Suite), formato
    // EAA... — esse tipo só é aceito pelo endpoint do Facebook Graph API, não pelo
    // graph.instagram.com (que espera tokens IGQVJ.../IGAA... do fluxo Instagram Login).
    const url =
      `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp` +
      `&limit=6` +
      `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('INSTAGRAM API ERRO:', JSON.stringify(data));
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const posts: InstagramPost[] = (data.data as InstagramMediaRaw[] | undefined)?.map(
      (post) => ({
        id: post.id,
        caption: post.caption ?? '',
        media_type: post.media_type,
        media_url: post.media_type === 'VIDEO' ? post.thumbnail_url ?? post.media_url : post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
      })
    ) ?? [];

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('INSTAGRAM FEED ERRO:', error);
    // Nunca retornar erro 500 — a home não pode quebrar por causa do feed.
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
