'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Trash2,
} from 'lucide-react';
import CustomSelect from '@/components/admin/CustomSelect';
import PriceInput from '@/components/admin/PriceInput';
import ImageUploader from '@/components/admin/ImageUploader';
import { getCategories } from '@/lib/queries/categories';
import { validarProduto, type ProdutoImportado } from '@/lib/utils/importacao';
import type { Category } from '@/lib/types';

type EstadoPagina = 'upload' | 'revisao' | 'importando' | 'resultado';

type Falha = { slug: string; nome: string; erro: string };
type Sucesso = { id: string; nome: string; slug: string };
type Resultado = { importados: number; falhas: Falha[]; sucesso: Sucesso[] };

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  draft: 'Rascunho',
};

const STATUS_CLASS: Record<string, string> = {
  active: 'bg-[#22c55e]/15 text-[#22c55e]',
  inactive: 'bg-[#888888]/15 text-[#888888]',
  draft: 'bg-[#f59e0b]/15 text-[#f59e0b]',
};

const CONDICAO_OPTIONS = [
  { label: 'Novo', value: 'new' },
  { label: 'Semi-novo', value: 'used' },
];

const STATUS_OPTIONS = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Rascunho', value: 'draft' },
];

const inputClass =
  'w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors';
const labelClass = 'block text-sm text-[#888888] mb-1.5';

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#f4f4f4]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#22c55e]' : 'bg-[#2a2a2a]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ProdutoCard({
  produto,
  index,
  categorias,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: {
  produto: ProdutoImportado;
  index: number;
  categorias: Category[];
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<ProdutoImportado>) => void;
  onRemove: () => void;
}) {
  const categoriaInfo = categorias.find((c) => c.slug === produto.categoria);
  const categoriaLabel = categoriaInfo?.name ?? (produto.categoria || '—');

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl mb-4 overflow-hidden">
      <div
        onClick={onToggleExpand}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#242424] transition-colors flex-wrap"
      >
        {expanded ? (
          <ChevronDown size={16} className="text-[#888888] shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[#888888] shrink-0" />
        )}

        <span className="text-xs text-[#888888] shrink-0">Linha {produto.linha}</span>

        <input
          value={produto.nome}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ nome: e.target.value })}
          className="flex-1 min-w-[160px] bg-transparent text-sm text-[#f4f4f4] font-medium outline-none border-b border-transparent focus:border-[#2a2a2a] py-0.5"
        />

        <span
          className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
            categoriaInfo ? 'bg-[#2a2a2a] text-[#888888]' : 'bg-[#ef4444]/15 text-[#ef4444]'
          }`}
        >
          {categoriaLabel}
        </span>

        <span
          className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${STATUS_CLASS[produto.status]}`}
        >
          {STATUS_LABEL[produto.status]}
        </span>

        {produto.erros.length > 0 && (
          <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#ef4444]/15 text-[#ef4444] shrink-0">
            {produto.erros.length} {produto.erros.length === 1 ? 'erro' : 'erros'}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-[#888888] hover:text-[#ef4444] transition-colors shrink-0 p-1"
          aria-label="Remover da importação"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#2a2a2a] space-y-4">
          {produto.erros.length > 0 && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-4 py-3">
              <ul className="text-sm text-[#ef4444] list-disc list-inside space-y-0.5">
                {produto.erros.map((erro) => (
                  <li key={erro}>{erro}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome *</label>
                <input
                  value={produto.nome}
                  onChange={(e) => onUpdate({ nome: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SKU</label>
                <input
                  value={produto.sku ?? ''}
                  onChange={(e) => onUpdate({ sku: e.target.value || null })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Categoria</label>
                <CustomSelect
                  value={produto.categoria}
                  onChange={(value) => onUpdate({ categoria: value })}
                  options={categorias.map((c) => ({ label: c.name, value: c.slug }))}
                />
              </div>

              <div>
                <label className={labelClass}>Condição</label>
                <CustomSelect
                  value={produto.condicao}
                  onChange={(value) => onUpdate({ condicao: value as 'new' | 'used' })}
                  options={CONDICAO_OPTIONS}
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <CustomSelect
                  value={produto.status}
                  onChange={(value) =>
                    onUpdate({ status: value as 'active' | 'inactive' | 'draft' })
                  }
                  options={STATUS_OPTIONS}
                />
              </div>

              <div>
                <label className={labelClass}>Preço (R$) *</label>
                <PriceInput
                  value={produto.preco ?? 0}
                  onChange={(cents) => onUpdate({ preco: cents })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Preço Promocional (R$)</label>
                <PriceInput
                  value={produto.preco_promo ?? 0}
                  onChange={(cents) => onUpdate({ preco_promo: cents > 0 ? cents : null })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Desconto à Vista (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={produto.desconto_vista}
                  onChange={(e) =>
                    onUpdate({
                      desconto_vista: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Estoque</label>
                <input
                  type="number"
                  min="0"
                  value={produto.estoque}
                  onChange={(e) => onUpdate({ estoque: parseInt(e.target.value, 10) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Toggle
                checked={produto.destaque}
                onChange={(v) => onUpdate({ destaque: v })}
                label="Exibir em Mais Vendidos"
              />
              <Toggle
                checked={produto.frete_gratis}
                onChange={(v) => onUpdate({ frete_gratis: v })}
                label="Frete Grátis"
              />
              <Toggle
                checked={produto.whatsapp_only}
                onChange={(v) => onUpdate({ whatsapp_only: v })}
                label="Finalizar pelo WhatsApp"
              />

              <div>
                <label className={labelClass}>Peso (kg)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={produto.peso ?? ''}
                  onChange={(e) => onUpdate({ peso: e.target.value ? parseFloat(e.target.value) : null })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Compr. (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produto.comprimento ?? ''}
                    onChange={(e) =>
                      onUpdate({ comprimento: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Larg. (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produto.largura ?? ''}
                    onChange={(e) =>
                      onUpdate({ largura: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Alt. (cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produto.altura ?? ''}
                    onChange={(e) =>
                      onUpdate({ altura: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Descrição Curta</label>
            <textarea
              rows={2}
              value={produto.descricao ?? ''}
              onChange={(e) => onUpdate({ descricao: e.target.value || null })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descrição Completa</label>
            <textarea
              rows={4}
              value={produto.descricao_full ?? ''}
              onChange={(e) => onUpdate({ descricao_full: e.target.value || null })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Imagens do produto (opcional)</label>
            <ImageUploader
              images={produto.images}
              onChange={(images) => onUpdate({ images })}
              folder="products"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImportarProdutosPage() {
  const [estado, setEstado] = useState<EstadoPagina>('upload');
  const [categorias, setCategorias] = useState<Category[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [produtos, setProdutos] = useState<ProdutoImportado[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    getCategories().then(setCategorias);
  }, []);

  function handleFileSelect(selected: File | null) {
    setErroUpload(null);
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.xlsx')) {
      setErroUpload('Envie um arquivo .xlsx.');
      return;
    }
    setFile(selected);
  }

  async function handleProcessar() {
    if (!file) return;
    setProcessando(true);
    setErroUpload(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/importar-produtos', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErroUpload(data.error ?? 'Erro ao processar planilha.');
        return;
      }
      setProdutos(data.produtos);
      setExpandedIndex(null);
      setEstado('revisao');
    } catch {
      setErroUpload('Erro ao processar planilha. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  }

  function updateProduto(index: number, patch: Partial<ProdutoImportado>) {
    setProdutos((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const next = { ...p, ...patch };
        next.erros = validarProduto(next);
        return next;
      })
    );
  }

  function removeProduto(index: number) {
    setProdutos((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  }

  async function handleImportar() {
    const validos = produtos.filter((p) => p.erros.length === 0);
    if (validos.length === 0) return;

    setEstado('importando');
    try {
      const res = await fetch('/api/admin/salvar-produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: validos }),
      });
      const data = await res.json();
      setResultado({
        importados: data.importados ?? 0,
        falhas: data.falhas ?? [],
        sucesso: data.sucesso ?? [],
      });
    } catch {
      setResultado({
        importados: 0,
        falhas: validos.map((p) => ({ slug: p.slug, nome: p.nome, erro: 'Erro de conexão.' })),
        sucesso: [],
      });
    } finally {
      setEstado('resultado');
    }
  }

  function handleReiniciar() {
    setFile(null);
    setProdutos([]);
    setResultado(null);
    setExpandedIndex(null);
    setEstado('upload');
  }

  const validosCount = produtos.filter((p) => p.erros.length === 0).length;
  const comErrosCount = produtos.length - validosCount;

  if (estado === 'upload') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-1">Importar Produtos em Massa</h1>
        <p className="text-sm text-[#888888] mb-8">
          Faça upload de uma planilha .xlsx com seus produtos
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files[0] ?? null);
          }}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-16 px-6 cursor-pointer text-center transition-colors ${
            isDragging ? 'border-[#f4f4f4] bg-[#1e1e1e]' : 'border-[#2a2a2a] hover:border-[#f4f4f4]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <>
              <CheckCircle2 size={48} className="text-[#22c55e]" />
              <div>
                <p className="text-sm text-[#f4f4f4] font-medium">{file.name}</p>
                <p className="text-xs text-[#888888] mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <FileSpreadsheet size={48} className="text-[#888888]" />
              <div>
                <p className="text-sm text-[#f4f4f4]">Arraste a planilha .xlsx aqui</p>
                <p className="text-xs text-[#888888] mt-1">ou clique para selecionar o arquivo</p>
              </div>
            </>
          )}
        </div>

        <a
          href="/downloads/modelo_pacesportce_desconto.xlsx"
          className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors mt-4"
        >
          <Download size={14} />
          Baixar planilha modelo
        </a>

        {erroUpload && <p className="text-sm text-[#ef4444] mt-4">{erroUpload}</p>}

        <button
          type="button"
          onClick={handleProcessar}
          disabled={!file || processando}
          className="w-full flex items-center justify-center gap-2 bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-3 text-sm mt-6 disabled:opacity-50 transition-opacity"
        >
          {processando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processando...
            </>
          ) : (
            'Processar Planilha'
          )}
        </button>
      </div>
    );
  }

  if (estado === 'revisao') {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-[#2a2a2a] py-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setEstado('upload')}
              className="text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors"
            >
              ← Voltar
            </button>
            <span className="text-sm text-[#888888]">Total: {produtos.length}</span>
            <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#22c55e]/15 text-[#22c55e]">
              {validosCount} válidos
            </span>
            {comErrosCount > 0 && (
              <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#ef4444]/15 text-[#ef4444]">
                {comErrosCount} com erros
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleImportar}
            disabled={validosCount === 0}
            className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-2.5 text-sm disabled:opacity-50 transition-opacity"
          >
            Importar {validosCount} {validosCount === 1 ? 'Produto' : 'Produtos'}
          </button>
        </div>

        {produtos.map((produto, index) => (
          <ProdutoCard
            key={`${produto.slug}-${index}`}
            produto={produto}
            index={index}
            categorias={categorias}
            expanded={expandedIndex === index}
            onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onUpdate={(patch) => updateProduto(index, patch)}
            onRemove={() => removeProduto(index)}
          />
        ))}

        {produtos.length === 0 && (
          <p className="text-sm text-[#888888] text-center py-12">
            Nenhum produto restante nesta importação.
          </p>
        )}
      </div>
    );
  }

  if (estado === 'importando') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 size={40} className="text-[#f4f4f4] animate-spin mb-4" />
        <p className="text-sm text-[#f4f4f4] mb-6">Importando {validosCount} produtos...</p>
        <div className="w-64 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-[#f4f4f4] rounded-full animate-[indeterminate_1.2s_ease-in-out_infinite]" />
        </div>
        <style>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  // estado === 'resultado'
  const total = resultado ? resultado.importados + resultado.falhas.length : 0;
  const sucessoTotal = resultado?.importados === total && (resultado?.falhas.length ?? 0) === 0;

  return (
    <div className="max-w-2xl mx-auto text-center">
      {sucessoTotal ? (
        <CheckCircle2 size={64} className="text-[#22c55e] mx-auto mb-4" />
      ) : (
        <CheckCircle2 size={64} className="text-[#f59e0b] mx-auto mb-4" />
      )}

      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-8">
        {sucessoTotal
          ? `${resultado?.importados ?? 0} produtos importados com sucesso!`
          : `${resultado?.importados ?? 0} importados, ${resultado?.falhas.length ?? 0} falharam`}
      </h1>

      {resultado && resultado.sucesso.length > 0 && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-4 text-left">
          <p className="text-sm font-medium text-[#f4f4f4] mb-3">Produtos importados</p>
          <div className="space-y-2">
            {resultado.sucesso.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#f4f4f4] truncate">{p.nome}</span>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="text-xs text-[#888888] hover:text-[#f4f4f4] transition-colors shrink-0"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {resultado && resultado.falhas.length > 0 && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 mb-4 text-left">
          <p className="text-sm font-medium text-[#ef4444] mb-3">Falharam</p>
          <div className="space-y-2">
            {resultado.falhas.map((f) => (
              <div key={f.slug}>
                <p className="text-sm text-[#f4f4f4]">{f.nome}</p>
                <p className="text-xs text-[#ef4444]">{f.erro}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/admin/produtos"
          className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-3 text-sm"
        >
          Ver lista de produtos
        </Link>
        {sucessoTotal && (
          <button
            type="button"
            onClick={handleReiniciar}
            className="border border-[#2a2a2a] text-[#f4f4f4] rounded-lg px-6 py-3 text-sm hover:bg-[#2a2a2a] transition-colors"
          >
            Importar mais produtos
          </button>
        )}
      </div>
    </div>
  );
}
