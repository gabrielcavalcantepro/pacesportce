'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/queries/settings';

type FormState = {
  whatsapp: string;
  address: string;
  opening_hours: string;
  about_text: string;
  instagram_handle: string;
  instagram_token: string;
};

const emptyForm: FormState = {
  whatsapp: '',
  address: '',
  opening_hours: '',
  about_text: '',
  instagram_handle: '',
  instagram_token: '',
};

const inputClass =
  'w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors';
const labelClass = 'block text-sm text-[#888888] mb-1.5';
const sectionClass = 'bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-4';

export default function AdminConfiguracoesPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    getSettings()
      .then((settings) =>
        setForm({
          whatsapp: settings.whatsapp ?? '',
          address: settings.address ?? '',
          opening_hours: settings.opening_hours ?? '',
          about_text: settings.about_text ?? '',
          instagram_handle: settings.instagram_handle ?? '',
          instagram_token: settings.instagram_token ?? '',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateSettings(form);
    setSaving(false);

    setMessage(
      result.success
        ? { type: 'success', text: 'Configurações salvas com sucesso.' }
        : { type: 'error', text: result.error ?? 'Erro ao salvar configurações.' }
    );
  }

  if (loading) {
    return <p className="text-[#888888] text-sm">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Configurações</h1>

      {message && (
        <div
          className={`text-sm rounded-lg px-4 py-3 mb-6 border ${
            message.type === 'success'
              ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
              : 'bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <section className={sectionClass}>
          <h2 className="text-base font-semibold text-[#f4f4f4]">Contato</h2>
          <div>
            <label className={labelClass}>WhatsApp (com DDI, ex: 5585999999999)</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Endereço</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Horário de funcionamento</label>
            <input
              value={form.opening_hours}
              onChange={(e) => setForm((f) => ({ ...f, opening_hours: e.target.value }))}
              className={inputClass}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-base font-semibold text-[#f4f4f4]">Sobre</h2>
          <div>
            <label className={labelClass}>Texto da seção &quot;Sobre a PaceSportce&quot;</label>
            <textarea
              rows={5}
              value={form.about_text}
              onChange={(e) => setForm((f) => ({ ...f, about_text: e.target.value }))}
              className={inputClass}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-base font-semibold text-[#f4f4f4]">Redes sociais</h2>
          <div>
            <label className={labelClass}>@ do Instagram</label>
            <input
              value={form.instagram_handle}
              onChange={(e) => setForm((f) => ({ ...f, instagram_handle: e.target.value }))}
              placeholder="@pacesportce"
              className={inputClass}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <button
            type="button"
            onClick={() => setIntegrationsOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-base font-semibold text-[#f4f4f4]">Integrações</h2>
            {integrationsOpen ? (
              <ChevronUp size={18} className="text-[#888888]" />
            ) : (
              <ChevronDown size={18} className="text-[#888888]" />
            )}
          </button>

          {integrationsOpen && (
            <div>
              <label className={labelClass}>Token do Instagram</label>
              <input
                value={form.instagram_token}
                onChange={(e) => setForm((f) => ({ ...f, instagram_token: e.target.value }))}
                placeholder="A ser configurado na Fase 3"
                className={inputClass}
              />
            </div>
          )}
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-3 text-sm disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
