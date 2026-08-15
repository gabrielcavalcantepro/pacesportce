'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { duplicateProduct, deleteProduct } from '@/lib/queries/products';

export default function ProductRowActions({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDuplicate() {
    setBusy(true);
    await duplicateProduct(productId);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    await deleteProduct(productId);
    setBusy(false);
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={busy}
        className="text-[#888888] hover:text-[#f4f4f4] transition-colors disabled:opacity-60"
        aria-label="Duplicar produto"
        title="Duplicar"
      >
        <Copy size={16} />
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={busy}
        className="text-[#888888] hover:text-[#ef4444] transition-colors disabled:opacity-60"
        aria-label="Excluir produto"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${productName}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={busy}
      />
    </div>
  );
}
