import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { InstagramPost } from '@/app/api/instagram/route';

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

async function getInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/instagram`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

interface InstagramFeedProps {
  handle: string;
}

export default async function InstagramFeed({ handle }: InstagramFeedProps) {
  const posts = await getInstagramPosts();
  const displayHandle = handle.startsWith('@') ? handle : `@${handle}`;

  return (
    <section id="instagram" className="py-20 lg:py-28 bg-[#151515]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2 text-[#f4f4f4]">
            <InstagramIcon size={24} />
            <span className="font-display text-[22px] sm:text-[28px] lg:text-[36px] font-bold">
              {displayHandle}
            </span>
          </div>
          <p className="text-sm lg:text-base text-[#888888]">Nos siga no Instagram</p>
        </div>

        {/* 3x2 grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          {posts.length > 0
            ? posts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-lg overflow-hidden group block bg-[#1e1e1e] border border-[#2a2a2a]"
                >
                  <Image
                    src={post.media_url}
                    alt={post.caption || 'Post do Instagram'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[#151515]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink size={22} className="text-[#f4f4f4]" />
                  </div>
                  {post.media_type === 'VIDEO' && (
                    <span className="absolute top-2 right-2 text-sm leading-none drop-shadow">
                      🎥
                    </span>
                  )}
                  {post.media_type === 'CAROUSEL_ALBUM' && (
                    <span className="absolute top-2 right-2 text-sm leading-none drop-shadow">
                      📷
                    </span>
                  )}
                </a>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg overflow-hidden flex items-center justify-center animate-pulse"
                >
                  <InstagramIcon size={28} />
                </div>
              ))}
        </div>

        <div className="text-center">
          <a
            href={`https://instagram.com/${handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#f4f4f4] text-[#f4f4f4] font-semibold px-8 py-3 rounded-lg hover:bg-[#f4f4f4] hover:text-[#151515] transition-colors"
          >
            <InstagramIcon size={18} />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
