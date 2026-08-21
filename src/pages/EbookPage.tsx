import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EBOOK_PAGES } from '../ebook/ebookData';
import { EbookReader } from '../ebook/EbookReader';
import { PageNavigation } from '../components/PageNavigation';
import { ExpirationWarning } from '../components/ExpirationWarning';
import { LoginModal } from '../components/LoginModal';

export const EbookPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  const pageQuery = parseInt(searchParams.get('page') || '1', 10);
  const currentPageNumber = isNaN(pageQuery) || pageQuery < 1 ? 1 : Math.min(100, pageQuery);

  const currentPage = EBOOK_PAGES[currentPageNumber - 1] || EBOOK_PAGES[0];

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Sync title
    document.title = `Trang ${currentPageNumber}: ${currentPage.title} — Tiếng Trung Bắc Hải`;
  }, [currentPageNumber, currentPage.title]);

  return (
    <div className="min-h-screen bg-amber-50/20 py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Expiration Banner for Logged-In Students */}
        <ExpirationWarning />

        {/* Ebook Reader Core */}
        <EbookReader
          page={currentPage}
          totalPages={100}
          onSelectPage={handlePageChange}
          onOpenLogin={() => setIsLoginOpen(true)}
          isTocOpen={isTocOpen}
          onCloseToc={() => setIsTocOpen(false)}
          allPages={EBOOK_PAGES}
        />

      </div>

      {/* Bottom Sticky Navigation */}
      <PageNavigation
        currentPage={currentPageNumber}
        totalPages={100}
        onPageChange={handlePageChange}
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        redirectTo={`/ebook?page=${currentPageNumber}`}
      />
    </div>
  );
};
