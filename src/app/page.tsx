import React from 'react';
import { getPTNdictionCatalog } from '@/db/queries';
import PTNdictionClient from '@/components/PTNdictionClient';



export default async function HomePage() {
  let catalog: Awaited<ReturnType<typeof getPTNdictionCatalog>> | null = null;
  let errorMessage: string | null = null;

  try {
    catalog = await getPTNdictionCatalog();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Gagal terhubung ke database PostgreSQL.';
  }

  if (errorMessage || !catalog || catalog.programs.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-extrabold text-slate-900">
            PTNdiction — Database Belum Siap
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {errorMessage
              ? `Koneksi PostgreSQL bermasalah: ${errorMessage}`
              : 'Tabel program studi masih kosong.'}
          </p>
          <div className="mt-4 rounded-xl bg-slate-900 p-3.5 font-mono text-xs text-slate-100">
            <p className="text-slate-400"># Jalankan perintah berikut di terminal:</p>
            <p className="mt-1">npx drizzle-kit push</p>
            <p>npx tsx src/db/seed.ts</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PTNdictionClient
      universities={catalog.universities}
      programs={catalog.programs}
    />
  );
}