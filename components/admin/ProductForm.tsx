'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus } from 'lucide-react';
import { generateSlug } from '@/lib/utils/slug';
import ImageUploader from '@/components/admin/ImageUploader';
import TagVariantInput from '@/components/admin/TagVariantInput';
import PriceInput from '@/components/admin/PriceInput';
import type { Category, Product, ProductVariants, VariantDimension } from '@/lib/types';
import type { ProductInput } from '@/lib/queries/products';

const specSchema = z.object({
  label: z.string().min(1, 'Obrigatório'),
  value: z.string().min(1, 'Obrigatório'),
});

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  condition: z.enum(['new', 'used']),
  status: z.enum(['active', 'inactive', 'draft']),
  featured: z.boolean(),
  whatsappOnly: z.boolean(),
  price: z.number().min(1, 'Preço é obrigatório'),
  compareAtPrice: z.number(),
  stock: z.string().min(1, 'Estoque é obrigatório'),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  freeShipping: z.boolean(),
  weight: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  specifications: z.array(specSchema),
});

type FormValues = z.infer<typeof productSchema>;

const emptyVariants: ProductVariants = { dimensions: [], combinations: [] };

function recalculateCombinations(
  dimensions: VariantDimension[],
  previousCombinations: ProductVariants['combinations']
): ProductVariants['combinations'] {
  const validDimensions = dimensions.filter((d) => d.name.trim() && d.options.length > 0);
  if (validDimensions.length === 0) return [];

  const previousByKey = new Map(previousCombinations.map((c) => [c.key, c.price]));

  let keys: string[] = [''];
  for (const dimension of validDimensions) {
    const next: string[] = [];
    for (const prefix of keys) {
      for (const option of dimension.options) {
        next.push(prefix === '' ? option : `${prefix}|${option}`);
      }
    }
    keys = next;
  }

  return keys.map((key) => ({ key, price: previousByKey.get(key) ?? null }));
}

function toFormValues(product?: Partial<Product>): FormValues {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    category_id: product?.category_id ?? '',
    condition: product?.condition ?? 'new',
    status: product?.status ?? 'draft',
    featured: product?.featured ?? false,
    whatsappOnly: product?.whatsapp_only ?? false,
    price: product?.price ?? 0,
    compareAtPrice: product?.compare_at_price ?? 0,
    stock: product?.stock != null ? String(product.stock) : '0',
    description: product?.description ?? '',
    fullDescription: product?.full_description ?? '',
    freeShipping: product?.free_shipping ?? false,
    weight: product?.weight != null ? String(product.weight) : '',
    length: product?.length != null ? String(product.length) : '',
    width: product?.width != null ? String(product.width) : '',
    height: product?.height != null ? String(product.height) : '',
    specifications: product?.specifications ?? [],
  };
}

type ProductFormProps = {
  defaultValues?: Partial<Product>;
  categories: Category[];
  onSubmit: (data: ProductInput) => Promise<void>;
  isLoading: boolean;
};

const inputClass =
  'w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors';
const labelClass = 'block text-sm text-[#888888] mb-1.5';
const sectionClass = 'bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-4';
const sectionTitleClass = 'text-base font-semibold text-[#f4f4f4] mb-1';

export default function ProductForm({
  defaultValues,
  categories,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [variants, setVariants] = useState<ProductVariants>(defaultValues?.variants ?? emptyVariants);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(defaultValues),
  });

  const specFields = useFieldArray({ control, name: 'specifications' });

  function addDimension() {
    setVariants((prev) => ({
      ...prev,
      dimensions: [...prev.dimensions, { name: '', options: [] }],
    }));
  }

  function updateDimension(index: number, dimension: VariantDimension) {
    setVariants((prev) => {
      const dimensions = prev.dimensions.map((d, i) => (i === index ? dimension : d));
      return { dimensions, combinations: recalculateCombinations(dimensions, prev.combinations) };
    });
  }

  function removeDimension(index: number) {
    setVariants((prev) => {
      const dimensions = prev.dimensions.filter((_, i) => i !== index);
      return { dimensions, combinations: recalculateCombinations(dimensions, prev.combinations) };
    });
  }

  function updateCombinationPrice(key: string, cents: number) {
    setVariants((prev) => ({
      ...prev,
      combinations: prev.combinations.map((c) =>
        c.key === key ? { ...c, price: cents > 0 ? cents : null } : c
      ),
    }));
  }

  async function handleFormSubmit(values: FormValues) {
    const payload: ProductInput = {
      name: values.name,
      slug: values.slug,
      description: values.description?.trim() || null,
      full_description: values.fullDescription?.trim() || null,
      price: values.price,
      compare_at_price: values.compareAtPrice > 0 ? values.compareAtPrice : null,
      images,
      category_id: values.category_id || null,
      tags: defaultValues?.tags ?? [],
      stock: parseInt(values.stock, 10) || 0,
      featured: values.featured,
      whatsapp_only: values.whatsappOnly,
      status: values.status,
      condition: values.condition,
      free_shipping: values.freeShipping,
      weight: values.weight ? parseFloat(values.weight) : null,
      length: values.length ? parseFloat(values.length) : null,
      width: values.width ? parseFloat(values.width) : null,
      height: values.height ? parseFloat(values.height) : null,
      specifications: values.specifications,
      variants,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* Informações básicas */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Informações básicas</h2>

        <div>
          <label htmlFor="name" className={labelClass}>
            Nome
          </label>
          <input
            id="name"
            {...register('name', {
              onChange: (e) => {
                if (!slugTouched) setValue('slug', generateSlug(e.target.value));
              },
            })}
            className={inputClass}
          />
          {errors.name && <p className="text-xs text-[#ef4444] mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            {...register('slug', { onChange: () => setSlugTouched(true) })}
            className={inputClass}
          />
          {errors.slug && <p className="text-xs text-[#ef4444] mt-1">{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category_id" className={labelClass}>
              Categoria
            </label>
            <select id="category_id" {...register('category_id')} className={inputClass}>
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-[#ef4444] mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="condition" className={labelClass}>
              Condição
            </label>
            <select id="condition" {...register('condition')} className={inputClass}>
              <option value="new">Novo</option>
              <option value="used">Semi-novo</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select id="status" {...register('status')} className={inputClass}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
          <input type="checkbox" {...register('featured')} className="accent-[#f4f4f4]" />
          Exibir como destaque
        </label>

        <div>
          <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
            <input type="checkbox" {...register('whatsappOnly')} className="accent-[#f4f4f4]" />
            Finalizar pelo WhatsApp
          </label>
          <p className="text-xs text-[#888888] mt-1">
            O botão de carrinho será substituído por um botão de WhatsApp na página do produto
          </p>
        </div>
      </section>

      {/* Preço e estoque */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Preço e estoque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>
              Preço (R$)
            </label>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <PriceInput
                  id="price"
                  value={field.value}
                  onChange={field.onChange}
                  className={inputClass}
                />
              )}
            />
            {errors.price && <p className="text-xs text-[#ef4444] mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label htmlFor="compareAtPrice" className={labelClass}>
              Preço promocional (R$)
            </label>
            <Controller
              control={control}
              name="compareAtPrice"
              render={({ field }) => (
                <PriceInput
                  id="compareAtPrice"
                  value={field.value}
                  onChange={field.onChange}
                  className={inputClass}
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="stock" className={labelClass}>
              Estoque
            </label>
            <input
              id="stock"
              type="number"
              step="1"
              min="0"
              {...register('stock')}
              className={inputClass}
            />
            {errors.stock && <p className="text-xs text-[#ef4444] mt-1">{errors.stock.message}</p>}
          </div>
        </div>
      </section>

      {/* Descrição */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Descrição</h2>
        <div>
          <label htmlFor="description" className={labelClass}>
            Descrição curta (preview na loja)
          </label>
          <textarea id="description" rows={3} {...register('description')} className={inputClass} />
        </div>
        <div>
          <label htmlFor="fullDescription" className={labelClass}>
            Descrição completa
          </label>
          <textarea
            id="fullDescription"
            rows={6}
            {...register('fullDescription')}
            className={inputClass}
          />
        </div>
      </section>

      {/* Imagens */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Imagens</h2>
        <p className="text-xs text-[#888888] -mt-2 mb-1">
          Recomendado: imagens quadradas (proporção 1:1), mínimo 1200×1200px, em JPG, PNG ou
          WEBP. Esse formato garante uma exibição nítida tanto no computador quanto no celular —
          fotos que não forem quadradas serão cortadas automaticamente para se encaixar.
        </p>
        <ImageUploader images={images} onChange={setImages} folder="products" />
      </section>

      {/* Frete */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Frete</h2>
        <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
          <input type="checkbox" {...register('freeShipping')} className="accent-[#f4f4f4]" />
          Frete grátis para este produto
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="weight" className={labelClass}>
              Peso (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.001"
              min="0"
              {...register('weight')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="length" className={labelClass}>
              Comprimento (cm)
            </label>
            <input
              id="length"
              type="number"
              step="0.01"
              min="0"
              {...register('length')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="width" className={labelClass}>
              Largura (cm)
            </label>
            <input
              id="width"
              type="number"
              step="0.01"
              min="0"
              {...register('width')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="height" className={labelClass}>
              Altura (cm)
            </label>
            <input
              id="height"
              type="number"
              step="0.01"
              min="0"
              {...register('height')}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Especificações */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Especificações</h2>
        <div className="space-y-3">
          {specFields.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <input
                placeholder="Label"
                {...register(`specifications.${index}.label` as const)}
                className={inputClass}
              />
              <input
                placeholder="Valor"
                {...register(`specifications.${index}.value` as const)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => specFields.remove(index)}
                className="p-2.5 text-[#888888] hover:text-[#ef4444] transition-colors shrink-0"
                aria-label="Remover especificação"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => specFields.append({ label: '', value: '' })}
          className="flex items-center gap-2 text-sm text-[#f4f4f4] hover:text-white transition-colors"
        >
          <Plus size={16} /> Adicionar especificação
        </button>
      </section>

      {/* Variantes */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Variantes (opcional)</h2>
        <div className="space-y-4">
          {variants.dimensions.map((dimension, index) => (
            <TagVariantInput
              key={index}
              value={dimension}
              onChange={(next) => updateDimension(index, next)}
              onRemove={() => removeDimension(index)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addDimension}
          className="flex items-center gap-2 text-sm text-[#f4f4f4] hover:text-white transition-colors"
        >
          <Plus size={16} /> Adicionar variante
        </button>

        {variants.combinations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#f4f4f4] mb-2">Preço por combinação</h3>
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#888888]">
                    <th className="px-4 py-3 font-normal">Combinação</th>
                    <th className="px-4 py-3 font-normal">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {variants.combinations.map((combo, index) => (
                    <tr key={combo.key} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#242424]'}>
                      <td className="px-4 py-3 text-[#f4f4f4]">
                        {combo.key.split('|').join(' / ')}
                      </td>
                      <td className="px-4 py-3">
                        <PriceInput
                          value={combo.price ?? 0}
                          onChange={(cents) => updateCombinationPrice(combo.key, cents)}
                          placeholder="Preço base"
                          className="w-full max-w-[160px] bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-3 text-sm disabled:opacity-60 transition-opacity"
      >
        {isLoading ? 'Salvando...' : 'Salvar produto'}
      </button>
    </form>
  );
}
