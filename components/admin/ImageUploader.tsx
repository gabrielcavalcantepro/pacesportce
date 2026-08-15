'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { uploadImage } from '@/lib/utils/upload';

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
  folder: 'products' | 'banners';
};

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ImageUploader({ images, onChange, folder }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((file) => ACCEPTED_TYPES.includes(file.type));
    if (files.length === 0) {
      setError('Envie apenas imagens PNG, JPG ou WEBP.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadImage(file, folder)));
      onChange([...images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
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
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-10 px-4 cursor-pointer text-center transition-colors ${
          isDragging ? 'border-[#3a3a3a] bg-[#1e1e1e]' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 size={24} className="text-[#888888] animate-spin" />
        ) : (
          <UploadCloud size={24} className="text-[#888888]" />
        )}
        <p className="text-sm text-[#888888]">
          {uploading ? 'Enviando imagens...' : 'Arraste imagens aqui ou clique para selecionar'}
        </p>
        <p className="text-xs text-[#888888]">PNG, JPG ou WEBP</p>
      </div>

      {error && <p className="text-xs text-[#ef4444] mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#151515]"
            >
              <Image src={url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors"
                aria-label="Remover imagem"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
