import React, { useState, useEffect } from 'react';
import { mainTitleApi } from '../../api';
import Modal from '../../components/Modal';
import TextEditor from '../../components/forms/TextEditor';
import { PencilIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { MainTitle } from '../../types';

const MainTitlePage: React.FC = () => {
  const [mainTitle, setMainTitle] = useState<MainTitle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleContent, setTitleContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMainTitle();
  }, []);

  const fetchMainTitle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mainTitleApi.get();
      if (response.success) {
        if (response.mainTitle) {
          setMainTitle(response.mainTitle);
          setTitleContent(response.mainTitle.title);
        } else {
          setMainTitle(null);
          setTitleContent('');
        }
      } else {
        setError(response.error || '메인 타이틀을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('메인 타이틀을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!titleContent.trim()) {
      alert('문구를 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      if (mainTitle) {
        // 수정
        const response = await mainTitleApi.update(mainTitle.id, titleContent);
        if (response.success && response.mainTitle) {
          setMainTitle(response.mainTitle);
          setTitleContent(response.mainTitle.title);
          setIsModalOpen(false);
          alert('문구가 저장되었습니다.');
        } else {
          alert(response.error || '저장에 실패했습니다.');
        }
      } else {
        // 생성
        const response = await mainTitleApi.create(titleContent);
        if (response.success && response.mainTitle) {
          setMainTitle(response.mainTitle);
          setTitleContent(response.mainTitle.title);
          setIsModalOpen(false);
          alert('문구가 저장되었습니다.');
        } else {
          alert(response.error || '저장에 실패했습니다.');
        }
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (mainTitle) {
      setTitleContent(mainTitle.title);
    } else {
      setTitleContent('');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">홈페이지 문구 관리</h1>
        <p className="text-gray-600">홈페이지 메인 타이틀 문구를 관리할 수 있습니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="mt-4 text-gray-600">로딩 중...</span>
          </div>
        </div>
      ) : !mainTitle ? (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-4">
                <DocumentTextIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">저장된 문구가 없습니다</h3>
            <p className="text-gray-600 mb-6">홈페이지 메인 타이틀 문구를 추가해주세요.</p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              문구 추가
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">저장된 문구</h3>
              </div>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 shadow-sm hover:shadow"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                수정
              </button>
            </div>
          </div>
          <div className="p-6">
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: mainTitle.title }}
            />
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>최종 수정일: {new Date(mainTitle.updatedAt).toLocaleString('ko-KR')}</span>
                <span>생성일: {new Date(mainTitle.createdAt).toLocaleString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 문구 편집 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={mainTitle ? '문구 수정' : '문구 추가'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </span>
              ) : (
                '저장'
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문구 <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <TextEditor
                content={titleContent}
                setContent={setTitleContent}
                showImageAndLink={false}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">HTML 형식으로 문구를 입력할 수 있습니다.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainTitlePage;

