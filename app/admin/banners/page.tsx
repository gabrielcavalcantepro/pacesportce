'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import BannerForm from '@/components/admin/BannerForm';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  type BannerInput,
} from '@/lib/queries/banners';
import type { Banner } from '@/lib/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

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
    setEditingBanner(null);
    setPanelOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditingBanner(banner);
    setPanelOpen(true);
  }

  async function handleSave(data: BannerInput) {
    setSaving(true);
    const result = editingBanner
      ? await updateBanner(editingBanner.id, data)
      : await createBanner(data);
    setSaving(false);

    if (result.success) {
      setPanelOpen(false);
      loadData();
    }
  }

  async function handleToggleActive(banner: Banner) {
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b))
    );
    await updateBanner(banner.id, { active: !banner.active });
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
        <BannerForm
          defaultValues={editingBanner}
          onSubmit={handleSave}
          onCancel={() => setPanelOpen(false)}
          isLoading={saving}
        />
      )}

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
              <th className="p-4 font-normal">Imagem</th>
              <th className="p-4 font-normal">Versões</th>
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
                      alt="Banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#3b82f6]/15 text-[#3b82f6]">
                      Desktop
                    </span>
                    {banner.image_mobile_url && (
                      <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#a855f7]/15 text-[#a855f7]">
                        Mobile
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-[#f4f4f4]">{banner.display_order}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`text-xs font-medium rounded-full px-2.5 py-1 transition-colors ${
                      banner.active
                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                        : 'bg-[#888888]/15 text-[#888888]'
                    }`}
                  >
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </button>
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
        message="Tem certeza que deseja excluir este banner?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
