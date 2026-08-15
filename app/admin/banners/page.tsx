'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '@/lib/queries/banners';
import type { Banner } from '@/lib/types';

type FormState = {
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  display_order: string;
  active: boolean;
};

const emptyForm: FormState = {
  image_url: '',
  title: '',
  subtitle: '',
  cta_text: '',
  cta_link: '',
  display_order: '0',
  active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    setBanners(await getBanners());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditingId(banner.id);
    setForm({
      image_url: banner.image_url,
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      cta_text: banner.cta_text ?? '',
      cta_link: banner.cta_link ?? '',
      display_order: String(banner.display_order),
      active: banner.active,
    });
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.image_url) {
      setFormError('Envie uma imagem para o banner.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      image_url: form.image_url,
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      cta_text: form.cta_text.trim() || null,
      cta_link: form.cta_link.trim() || null,
      display_order: parseInt(form.display_order, 10) || 0,
      active: form.active,
    };

    const result = editingId
      ? await updateBanner(editingId, payload)
      : await createBanner(payload);

    setSaving(false);

    if (result.success) {
      setPanelOpen(false);
      loadData();
    } else {
      setFormError(result.error ?? 'Erro ao salvar banner.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteBanner(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    loadData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#f4f4f4]">Banners</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-4 py-2.5 text-sm"
        >
          <Plus size={16} />
          Novo Banner
        </button>
      </div>

      {panelOpen && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-base font-semibold text-[#f4f4f4]">
            {editingId ? 'Editar banner' : 'Novo banner'}
          </h2>

          <ImageUploader
            images={form.image_url ? [form.image_url] : []}
            onChange={(imgs) => setForm((f) => ({ ...f, image_url: imgs[imgs.length - 1] ?? '' }))}
            folder="banners"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Título</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Subtítulo</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Texto do CTA</label>
              <input
                value={form.cta_text}
                onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Link do CTA</label>
              <input
                value={form.cta_link}
                onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Ordem de exibição</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="accent-[#f4f4f4]"
                />
                Ativo
              </label>
            </div>
          </div>

          {formError && <p className="text-sm text-[#ef4444]">{formError}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => setPanelOpen(false)}
              className="border border-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
              <th className="p-4 font-normal">Imagem</th>
              <th className="p-4 font-normal">Título</th>
              <th className="p-4 font-normal">Ordem</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Ações</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b border-[#2a2a2a] last:border-0">
                <td className="p-4">
                  <div className="relative w-32 h-[80px] rounded-lg overflow-hidden bg-[#151515] border border-[#2a2a2a]">
                    <Image
                      src={banner.image_url}
                      alt={banner.title ?? ''}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="p-4 text-[#f4f4f4]">{banner.title ?? '—'}</td>
                <td className="p-4 text-[#f4f4f4]">{banner.display_order}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                      banner.active
                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                        : 'bg-[#888888]/15 text-[#888888]'
                    }`}
                  >
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(banner)}
                      className="text-[#888888] hover:text-[#f4f4f4] transition-colors"
                      aria-label="Editar banner"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(banner)}
                      className="text-[#888888] hover:text-[#ef4444] transition-colors"
                      aria-label="Excluir banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && banners.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#888888]">
                  Nenhum banner cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir banner"
        message={`Tem certeza que deseja excluir o banner "${deleteTarget?.title ?? ''}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
