'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#151515] px-4">
      <Image
        src="/assets/logo-branco.webp"
        alt="PaceSportce"
        width={160}
        height={46}
        className="h-9 w-auto object-contain mb-8"
        priority
      />

      <div className="w-full max-w-sm bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-8">
        <h1 className="text-lg font-semibold text-[#f4f4f4] mb-6">Entrar no painel</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm text-[#888888] mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-[#ef4444] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[#888888] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#f4f4f4] transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#ef4444] mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-[#ef4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4f4f4] text-[#151515] font-medium rounded-lg py-2.5 text-sm mt-2 disabled:opacity-60 transition-opacity"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
