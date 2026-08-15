'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils/price';
import { prazoTexto } from '@/lib/utils/frete';
import { createOrder } from '@/lib/queries/orders';
import type { CheckoutCustomer } from '@/lib/types';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' });

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const checkoutSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  cpf: z.string().min(14, 'CPF inválido'),
  cep: z.string().min(9, 'CEP inválido'),
  street: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type SavedCard = {
  id: string;
  last_four_digits?: string;
  expiration_month?: number;
  expiration_year?: number;
  payment_method?: { id?: string };
};

const CUSTOMER_STORAGE_KEY = 'pacesportce_customer';
const CUSTOMER_ID_STORAGE_KEY = 'pacesportce_customer_id';

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function mapBrickPaymentType(paymentType: string): string {
  switch (paymentType) {
    case 'bank_transfer':
      return 'pix';
    case 'creditCard':
    case 'debitCard':
      return 'credit_card';
    case 'ticket':
      return 'boleto';
    default:
      return paymentType;
  }
}

const inputClass =
  'w-full bg-[#1e1e1e] border border-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-3 outline-none focus:border-[#f4f4f4] transition-colors text-sm';
const labelClass = 'block text-sm text-[#888888] mb-1.5';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, shipping, total, clearCart, hydrated } = useCart();

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [saveCard, setSaveCard] = useState(false);

  const {
    register,
    trigger,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  // Evita que o clearCart() do fluxo de sucesso (que esvazia o carrinho antes do
  // redirect para /confirmacao) dispare este guard e vença a corrida navegando
  // de volta para /carrinho.
  const orderCompletedRef = useRef(false);

  useEffect(() => {
    if (hydrated && items.length === 0 && !orderCompletedRef.current) {
      router.push('/carrinho');
    }
  }, [hydrated, items, router]);

  // Pré-preenche o formulário com dados salvos de uma compra anterior e, se houver
  // um customerId salvo, busca os cartões desse cliente diretamente (sem precisar
  // esperar o onBlur do e-mail).
  useEffect(() => {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (saved) {
      try {
        reset(JSON.parse(saved));
        setSaveData(true);
      } catch {
        // ignora dados corrompidos
      }
    }

    const savedCustomerId = localStorage.getItem(CUSTOMER_ID_STORAGE_KEY);
    if (savedCustomerId) {
      setCustomerId(savedCustomerId);
      fetch(`/api/mp/customers?customerId=${savedCustomerId}`)
        .then((res) => res.json())
        .then((data) => setSavedCards(data.cards ?? []))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailBlur = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return;
    try {
      const res = await fetch('/api/mp/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomerId(data.customerId);
        setSavedCards(data.cards ?? []);
      }
    } catch {
      // busca de cliente é best-effort; não bloqueia o checkout
    }
  }, []);

  // Memoized so the Payment Brick isn't re-initialized (and duplicated in the DOM) on every
  // unrelated re-render of this form, e.g. the setValue calls from ViaCEP autofill.
  const totalEmReais = total / 100;
  const watchedEmail = watch('email');
  const brickInitialization = useMemo(
    () => ({
      amount: totalEmReais,
      payer: {
        email: watchedEmail ?? '',
        ...(customerId && { customerId }),
        ...(savedCards.length > 0 && { cardsIds: savedCards.map((c) => c.id) }),
      },
    }),
    [totalEmReais, watchedEmail, customerId, savedCards]
  );
  const brickCustomization = useMemo(
    () => ({
      paymentMethods: {
        creditCard: 'all' as const,
        debitCard: 'all' as const,
        bankTransfer: 'all' as const,
        ticket: 'all' as const,
      },
      visual: {
        style: {
          theme: 'dark' as const,
          customVariables: {
            baseColor: '#f4f4f4',
            baseColorFirstVariant: '#2a2a2a',
            baseColorSecondVariant: '#1e1e1e',
            textPrimaryColor: '#f4f4f4',
            textSecondaryColor: '#888888',
            borderRadiusSmall: '8px',
            borderRadiusMedium: '12px',
            borderRadiusLarge: '16px',
            buttonTextColor: '#151515',
          },
        },
      },
    }),
    []
  );

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCep(e.target.value);
    e.target.value = masked;
    setCepError(null);

    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
      } else {
        setValue('street', data.logradouro || '', { shouldValidate: true });
        setValue('neighborhood', data.bairro || '', { shouldValidate: true });
        setValue('city', data.localidade || '', { shouldValidate: true });
        setValue('state', data.uf || '', { shouldValidate: true });
      }
    } catch {
      setCepError('Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  }

  const handleBrickSubmit = useCallback(async (
    brickData: {
      paymentType: string;
      formData: { token?: string; payment_method_id?: string; installments?: number };
    },
    additionalData?: { paymentTypeId?: string } | null
  ) => {
    console.log('FORM DATA RECEBIDO:', JSON.stringify(brickData, null, 2));

    const valid = await trigger();
    if (!valid) {
      setFormError('Preencha corretamente todos os campos antes de continuar.');
      throw new Error('Formulário inválido.');
    }
    setFormError(null);
    setSubmitting(true);

    const customer = getValues() as CheckoutCustomer;

    const orderResult = await createOrder({
      customer,
      items,
      shipping,
      total,
      paymentMethod: mapBrickPaymentType(brickData.paymentType),
    });

    if (!orderResult.success || !orderResult.data) {
      setSubmitting(false);
      setFormError(orderResult.error ?? 'Erro ao criar pedido.');
      throw new Error(orderResult.error ?? 'Erro ao criar pedido.');
    }

    const { orderNumber } = orderResult.data;

    try {
      const res = await fetch('/api/mp/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customer,
          items,
          total,
          paymentType: brickData.paymentType,
          formData: {
            ...brickData.formData,
            paymentTypeId: additionalData?.paymentTypeId,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitting(false);
        setFormError(data.error ?? 'Erro ao processar pagamento.');
        return;
      }

      if (data.pix_qr_code) {
        sessionStorage.setItem(
          'pix_data',
          JSON.stringify({
            qr_code: data.pix_qr_code,
            qr_code_base64: data.pix_qr_code_base64,
            ticket_url: data.pix_ticket_url,
          })
        );
      }

      if (data.boleto_ticket_url) {
        sessionStorage.setItem(
          'boleto_data',
          JSON.stringify({
            ticket_url: data.boleto_ticket_url,
            barcode: data.boleto_barcode,
          })
        );
      }

      if (saveData) {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
        if (customerId) localStorage.setItem(CUSTOMER_ID_STORAGE_KEY, customerId);
      } else {
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
        localStorage.removeItem(CUSTOMER_ID_STORAGE_KEY);
      }

      if (saveCard && customerId && brickData.formData.token) {
        try {
          await fetch('/api/mp/save-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, token: brickData.formData.token }),
          });
        } catch {
          // salvar cartão é best-effort; não bloqueia a confirmação do pedido
        }
      }

      const method = mapBrickPaymentType(brickData.paymentType);
      const status = data.payment_status;
      orderCompletedRef.current = true;
      clearCart();
      router.push(`/confirmacao?order=${orderNumber}&method=${method}&status=${status ?? ''}`);
    } catch {
      setSubmitting(false);
      setFormError('Erro ao processar pagamento. Tente novamente.');
    }
  }, [trigger, getValues, items, shipping, total, clearCart, router, saveData, saveCard, customerId]);

  const handleBrickError = useCallback((error: unknown) => {
    console.error('MP Brick error:', error);
    setFormError('Erro ao carregar o formulário de pagamento.');
  }, []);

  if (!hydrated || items.length === 0) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allFreeShipping = items.length > 0 && items.every((i) => i.free_shipping);
  const freteGratisFortaleza = !allFreeShipping && shipping?.company === 'Grátis';
  const freteGratis = allFreeShipping || freteGratisFortaleza;

  console.log('MP amount (reais):', totalEmReais);

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/carrinho"
          className="inline-block mb-6 text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors"
        >
          ← Voltar ao carrinho
        </Link>

        <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-8">
          Finalizar Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="font-semibold text-[#f4f4f4] text-lg mb-4">Seus dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome completo</label>
                  <input {...register('name')} className={inputClass} />
                  {errors.name && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>E-mail</label>
                  <input
                    type="email"
                    autoComplete="off"
                    {...register('email', {
                      onBlur: (e) => handleEmailBlur(e.target.value),
                    })}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Telefone</label>
                  <input
                    placeholder="(99) 99999-9999"
                    inputMode="numeric"
                    {...register('phone', {
                      onChange: (e) => {
                        e.target.value = maskPhone(e.target.value);
                      },
                    })}
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>CPF</label>
                  <input
                    placeholder="999.999.999-99"
                    inputMode="numeric"
                    {...register('cpf', {
                      onChange: (e) => {
                        e.target.value = maskCpf(e.target.value);
                      },
                    })}
                    className={inputClass}
                  />
                  {errors.cpf && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    placeholder="99999-999"
                    inputMode="numeric"
                    {...register('cep', { onChange: handleCepChange })}
                    className={inputClass}
                  />
                  {cepLoading && <p className="text-xs text-[#888888] mt-1">Buscando CEP...</p>}
                  {cepError && <p className="text-xs text-[#ef4444] mt-1">{cepError}</p>}
                  {errors.cep && !cepError && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.cep.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Endereço</label>
                  <input {...register('street')} className={inputClass} />
                  {errors.street && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Número</label>
                  <input {...register('number')} className={inputClass} />
                  {errors.number && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Complemento (opcional)</label>
                  <input {...register('complement')} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Bairro</label>
                  <input {...register('neighborhood')} className={inputClass} />
                  {errors.neighborhood && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.neighborhood.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Cidade</label>
                  <input {...register('city')} className={inputClass} />
                  {errors.city && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Estado</label>
                  <select {...register('state')} className={inputClass}>
                    <option value="">Selecione...</option>
                    {UF_LIST.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-[#ef4444] mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-[#2a2a2a]">
              <h2 className="font-semibold text-[#f4f4f4] text-lg mb-4">Pagamento</h2>

              {formError && (
                <div className="bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}
              {submitting && (
                <div className="bg-[#1e1e1e] border border-[#2a2a2a] text-[#888888] text-sm rounded-lg px-4 py-3 mb-4">
                  Processando pedido...
                </div>
              )}

              {savedCards.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[#888888] mb-2">Cartões salvos:</p>
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg mb-2 cursor-pointer hover:border-[#f4f4f4]"
                    >
                      <span className="text-[#f4f4f4] text-sm">
                        {card.payment_method?.id?.toUpperCase()} •••• {card.last_four_digits} —{' '}
                        {card.expiration_month}/{card.expiration_year}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-[#888888] mb-3">
                <input
                  type="checkbox"
                  checked={saveData}
                  onChange={(e) => setSaveData(e.target.checked)}
                />
                Salvar meus dados para próximas compras
              </label>

              <label className="flex items-center gap-2 text-sm text-[#888888] mb-3">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                />
                Salvar cartão para próximas compras
              </label>

              <Payment
                initialization={brickInitialization}
                customization={brickCustomization}
                onSubmit={handleBrickSubmit}
                onError={handleBrickError}
              />
            </section>
          </div>

          {/* Right panel — order summary */}
          <div>
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 space-y-4 lg:sticky lg:top-24">
              <h2 className="font-semibold text-[#f4f4f4] text-lg">Resumo do Pedido</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${JSON.stringify(item.selectedVariant)}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#151515] border border-[#2a2a2a] shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f4f4f4] truncate">{item.name}</p>
                      <p className="text-xs text-[#888888]">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-[#f4f4f4] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm pt-4 border-t border-[#2a2a2a]">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Subtotal</span>
                  <span className="text-[#f4f4f4]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className={freteGratis ? 'text-[#22c55e] font-medium' : 'text-[#888888]'}>
                    {freteGratis
                      ? 'Frete'
                      : shipping
                      ? `Frete (${shipping.company} — ${prazoTexto(shipping.service, shipping.delivery_time)})`
                      : 'Frete'}
                  </span>
                  {freteGratis ? (
                    <span className="text-[#22c55e] font-medium shrink-0">
                      {allFreeShipping ? 'Grátis' : 'Grátis para Fortaleza'}
                    </span>
                  ) : shipping ? (
                    <span className="text-[#f4f4f4] shrink-0">{formatPrice(shipping.price)}</span>
                  ) : (
                    <span className="text-[#f59e0b] shrink-0">Calcule acima</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-between items-baseline">
                <span className="text-[#f4f4f4] font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#f4f4f4]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
