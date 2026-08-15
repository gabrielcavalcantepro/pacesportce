'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { generateSlug } from '@/lib/utils/slug';
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoriesOrder,
  deleteCategory,
} from '@/lib/queries/categories';
import { getProducts } from '@/lib/queries/products';
import type { Category } from '@/lib/types';

type FormState = {
  name: string;
  slug: string;
  display_order: string;
  active: boolean;
};

const emptyForm: FormState = { name: '', slug: '', display_order: '0', active: true };

function SortableCategoryRow({
  category,
  hasProducts,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  category: Category;
  hasProducts: boolean;
  onToggleActive: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-[#2a2a2a] last:border-0 ${
        isDragging ? 'opacity-50 bg-[#2a2a2a]' : ''
      }`}
    >
      <td className="p-4 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-[#888888] cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reordenar categoria"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="p-4 text-[#f4f4f4]">{category.name}</td>
      <td className="p-4 text-[#888888]">{category.slug}</td>
      <td className="p-4">
        <button
          onClick={() => onToggleActive(category)}
          className={`text-xs font-medium rounded-full px-2.5 py-1 ${
            category.active
              ? 'bg-[#22c55e]/15 text-[#22c55e]'
              : 'bg-[#888888]/15 text-[#888888]'
          }`}
        >
          {category.active ? 'Ativa' : 'Inativa'}
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(category)}
            className="text-[#888888] hover:text-[#f4f4f4] transition-colors"
            aria-label="Editar categoria"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => !hasProducts && onDelete(category)}
            disabled={hasProducts}
            title={hasProducts ? 'Categoria possui produtos vinculados' : undefined}
            className="text-[#888888] hover:text-[#ef4444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[#888888]"
            aria-label="Excluir categoria"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function loadData() {
    setLoading(true);
    const [cats, products] = await Promise.all([getCategories(), getProducts()]);
    setCategories(cats);
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
    }
    setProductCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      display_order: String(cat.display_order),
      active: cat.active,
    });
    setSlugTouched(true);
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      display_order: parseInt(form.display_order, 10) || 0,
      active: form.active,
    };

    const result = editingId
      ? await updateCategory(editingId, payload)
      : await createCategory(payload);

    setSaving(false);

    if (result.success) {
      setPanelOpen(false);
      loadData();
    } else {
      setFormError(result.error ?? 'Erro ao salvar categoria.');
    }
  }

  async function handleToggleActive(cat: Category) {
    await updateCategory(cat.id, { active: !cat.active });
    loadData();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteCategory(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    loadData();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    const result = await updateCategoriesOrder(reordered.map((c) => c.id));
    if (!result.success) {
      loadData();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#f4f4f4]">Categorias</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-4 py-2.5 text-sm"
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {panelOpen && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-base font-semibold text-[#f4f4f4]">
            {editingId ? 'Editar categoria' : 'Nova categoria'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#888888] mb-1.5">Nome</label>
              <input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: slugTouched ? f.slug : generateSlug(name),
                  }));
                }}
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
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="accent-[#f4f4f4]"
            />
            Ativa
          </label>

          {formError && <p className="text-sm text-[#ef4444]">{formError}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.slug.trim()}
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
                <th className="p-4 font-normal w-8" />
                <th className="p-4 font-normal">Nome</th>
                <th className="p-4 font-normal">Slug</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Ações</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((cat) => (
                  <SortableCategoryRow
                    key={cat.id}
                    category={cat}
                    hasProducts={(productCounts[cat.id] ?? 0) > 0}
                    onToggleActive={handleToggleActive}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </SortableContext>

              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#888888]">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DndContext>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
