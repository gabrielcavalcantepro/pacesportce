'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getProductReviews, createReview } from '@/lib/queries/public';
import type { Review } from '@/lib/types';

const PAGE_SIZE = 5;

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays <= 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 30) return `há ${diffDays} dias`;

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#888888]'}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getProductReviews(productId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim()) {
      setFormError('Digite seu nome.');
      return;
    }
    if (rating < 1) {
      setFormError('Selecione uma avaliação em estrelas.');
      return;
    }

    setSubmitting(true);
    const result = await createReview({
      product_id: productId,
      author_name: authorName.trim(),
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setAuthorName('');
      setRating(0);
      setComment('');
    } else {
      setFormError(result.error ?? 'Erro ao enviar avaliação.');
    }
  }

  return (
    <section className="mt-16 pt-16 border-t border-[#2a2a2a]">
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <h2 className="font-display text-xl font-bold text-[#f4f4f4]">Avaliações</h2>
        {!loading && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRow rating={average} />
            <span className="text-sm text-[#f4f4f4]">{average.toFixed(1)}</span>
            <span className="text-sm text-[#888888]">
              · {reviews.length} avaliaç{reviews.length === 1 ? 'ão' : 'ões'}
            </span>
          </div>
        )}
      </div>

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-[#888888] mb-8">Seja o primeiro a avaliar este produto</p>
      )}

      {reviews.length > 0 && (
        <div className="space-y-6 mb-8">
          {reviews.slice(0, visibleCount).map((review) => (
            <div key={review.id} className="border-b border-[#2a2a2a] pb-6 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[#f4f4f4]">{review.author_name}</p>
                <p className="text-xs text-[#888888]">{formatReviewDate(review.created_at)}</p>
              </div>
              <StarRow rating={review.rating} size={14} />
              {review.comment && (
                <p className="text-sm text-[#888888] mt-2 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}

          {visibleCount < reviews.length && (
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="text-sm text-[#f4f4f4] underline underline-offset-2 hover:text-white transition-colors"
            >
              Ver mais
            </button>
          )}
        </div>
      )}

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 max-w-lg">
        <h3 className="text-base font-semibold text-[#f4f4f4] mb-4">Deixe sua avaliação</h3>

        {submitted ? (
          <p className="text-sm text-[#22c55e]">Avaliação enviada! Ela aparecerá após aprovação.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Nome</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Avaliação</label>
              <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoveredRating(i)}
                    onClick={() => setRating(i)}
                    aria-label={`${i} estrela${i > 1 ? 's' : ''}`}
                    className="p-0.5"
                  >
                    <Star
                      size={24}
                      className={
                        i <= (hoveredRating || rating)
                          ? 'fill-[#f59e0b] text-[#f59e0b]'
                          : 'text-[#888888]'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Comentário</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
              />
            </div>

            {formError && <p className="text-sm text-[#ef4444]">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-2.5 text-sm disabled:opacity-60 transition-opacity"
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
