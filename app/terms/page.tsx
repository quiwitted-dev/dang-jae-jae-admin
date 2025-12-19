'use client';

import TermsContent from '@/components/my/TermsContent';
import { POLICIES_TERMS, PRIVATE_TERMS } from '@/constants/terms';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TermsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex items-center h-16 px-4 bg-white border-b border-gray-200">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 transition-colors rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="ml-2 text-lg font-bold text-gray-900">약관 및 정책</h1>
      </header>

      <main className="max-w-4xl px-4 mx-auto mt-8 space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">이용약관 및 정책</h2>
          </div>
          <TermsContent terms={POLICIES_TERMS} />
        </section>

        <section>
          <div className="mb-4 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">개인정보처리방침</h2>
          </div>
          <TermsContent terms={PRIVATE_TERMS} />
        </section>
      </main>
    </div>
  );
};

export default TermsPage;
