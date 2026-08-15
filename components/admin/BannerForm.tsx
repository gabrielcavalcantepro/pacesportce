'use client';

import { useState } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Banner } from '@/lib/types';
import type { BannerInput } from '@/lib/queries/banners';

type BannerFormProps = {
  defaultValues?: Banner | null;
  onSubmit: (data: BannerInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
};

export default function BannerForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: BannerFormProps) {
  const [imageUrl, setImageUrl] = useState(defaultValues?.image_url ?? '');
  const [imageMobileUrl, setImageMobileUrl] = useState(defaultValues?.image_mobile_url ?? '');
  const [displayOrder, setDisplayOrder] = useState(String(defaultValues?.display_order ?? 0));
  const [active, setActive] = useState(defaultValues?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!imageUrl) {
      setError('Envie a imagem desktop do banner.');
      return;
    }
    setError(null);
    await onSubmit({
      image_url: imageUrl,
      image_mobile_url: imageMobileUrl || null,
      display_order: parseInt(displayOrder, 10) || 0,
      active,
    });
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 mb-6 space-y-6">
      <h2 className="text-base font-semibold text-[#f4f4f4]">
        {defaultValues ? 'Editar banner' : 'Novo banner'}
      </h2>

      <div>
        <label className="block text-sm text-[#888888] mb-1.5">Imagem desktop</label>
        <p className="text-xs text-[#888888] mb-3">
          Tamanho recomendado: 1920×600px (proporção 16:5). Formatos: JPG, PNG, WEBP.
        </p>
        <ImageUploader
          images={imageUrl ? [imageUrl] : []}
          onChange={(imgs) => setImageUrl(imgs[imgs.length - 1] ?? '')}
          folder="banners"
        />
      </div>

      <div>
        <label className="block text-sm text-[#888888] mb-1.5">Imagem mobile</label>
        <p className="text-xs text-[#888888] mb-3">
          Tamanho recomendado: 768×500px (proporção 16:10). Formatos: JPG, PNG, WEBP. Se não
          enviada, a imagem desktop será usada no celular.
        </p>
        <ImageUploader
          images={imageMobileUrl ? [imageMobileUrl] : []}
          onChange={(imgs) => setImageMobileUrl(imgs[imgs.length - 1] ?? '')}
          folder="banners"
        />
      </div>

      <div className="flex items-end gap-6 flex-wrap">
        <div>
          <label className="block text-sm text-[#888888] mb-1.5">Ordem de exibição</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-32 bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit pb-2.5">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-[#f4f4f4]"
          />
          Ativo
        </label>
      </div>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-4 py-2.5 text-sm disabled:opacity-60"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
