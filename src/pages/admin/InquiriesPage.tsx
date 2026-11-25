import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ActionButton from '../../components/ActionButton';
import type { Inquiry, InquiryCategory, InquiryStatus } from '../../types';

const INQUIRY_CATEGORIES: InquiryCategory[] = ['결제/환불', '비교/리포트', '데이터/정보', '기타'];

const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '답변대기',
  ANSWERED: '답변완료',
};

const STATUS_COLORS: Record<InquiryStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ANSWERED: 'bg-green-100 text-green-800',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | InquiryStatus>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | InquiryCategory>('ALL');
  const [counts, setCounts] = useState<Partial<Record<InquiryStatus, number>>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus, selectedCategory, page]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getInquiries({
        page,
        limit,
        ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
        ...(selectedCategory !== 'ALL' ? { category: selectedCategory } : {}),
      });

      if (response.success && response.inquiries) {
        setInquiries(response.inquiries);
        setCounts(response.counts || {});
        setTotal(response.pagination?.total ?? response.inquiries.length);
      } else {
        setError(response.error || '문의 목록을 불러오는데 실패했습니다.');
        setInquiries([]);
      }
    } catch (err) {
      setError('문의 목록을 불러오는 중 오류가 발생했습니다.');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || '');
    setIsDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const response = await adminApi.getInquiryById(inquiry.id);
      if (response.success && response.inquiry) {
        setSelectedInquiry(response.inquiry);
        setAnswer(response.inquiry.answer || '');
      }
    } catch (err) {
      // 목록 데이터로라도 응대 가능하도록 유지
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedInquiry(null);
    setAnswer('');
    setDetailLoading(false);
  };

  const handleSaveAnswer = async () => {
    if (!selectedInquiry) return;

    const trimmed = answer.trim();
    if (!trimmed) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    if (!confirm('답변을 저장하면 상태가 답변완료로 변경됩니다. 저장할까요?')) {
      return;
    }

    setSavingAnswer(true);
    try {
      const response = await adminApi.answerInquiry(selectedInquiry.id, trimmed);
      if (response.success && response.inquiry) {
        alert(response.message || '답변이 저장되었습니다. 사용자가 바로 확인할 수 있습니다.');
        setSelectedInquiry(response.inquiry);
        setAnswer(response.inquiry.answer || '');
        fetchInquiries();
      } else {
        alert(response.error || '답변 저장에 실패했습니다.');
      }
    } catch (err) {
      alert('답변 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingAnswer(false);
    }
  };

  const pendingCount = counts.PENDING ?? 0;
  const answeredCount = counts.ANSWERED ?? 0;
  const allCount = pendingCount + answeredCount;

  const columns = [
    {
      header: '제목',
      accessor: 'title' as keyof Inquiry,
      className: 'max-w-xs truncate font-medium text-gray-900',
    },
    {
      header: '작성자',
      accessor: (row: Inquiry) => row.user?.nickname || '-',
      cell: (_value: string, row: Inquiry) => (
        <div className="min-w-[120px]">
          <div className="font-medium text-gray-900">{row.user?.nickname || '-'}</div>
          <div className="text-xs text-gray-500 truncate max-w-[160px]">
            {row.user?.email || row.user?.phoneNumber || row.user?.kakaoId || '-'}
          </div>
        </div>
      ),
    },
    {
      header: '문의 유형',
      accessor: 'category' as keyof Inquiry,
      className: 'whitespace-nowrap',
    },
    {
      header: '상태',
      accessor: 'status' as keyof Inquiry,
      cell: (value: InquiryStatus) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[value] || 'bg-gray-100 text-gray-700'}`}
        >
          {STATUS_LABELS[value] || value}
        </span>
      ),
    },
    {
      header: '작성일시',
      accessor: 'createdAt' as keyof Inquiry,
      cell: (value: string) => formatDateTime(value),
      className: 'whitespace-nowrap',
    },
    {
      header: '작업',
      accessor: () => null as any,
      cell: (_value: any, row: Inquiry) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail(row);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
        >
          {row.status === 'PENDING' ? '답변하기' : '상세'}
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">1:1 문의 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            사용자 문의에 답변하면 상태가 답변완료로 바뀌고, 사용자 화면에서 바로 확인할 수 있습니다.
          </p>
        </div>
        <ActionButton action="refresh" label="새로고침" onClick={fetchInquiries} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('ALL');
            setPage(1);
          }}
          className={`px-3 py-1.5 text-sm rounded-md border ${
            selectedStatus === 'ALL'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          전체{allCount > 0 ? ` (${allCount})` : ''}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('PENDING');
            setPage(1);
          }}
          className={`px-3 py-1.5 text-sm rounded-md border ${
            selectedStatus === 'PENDING'
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          답변대기{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedStatus('ANSWERED');
            setPage(1);
          }}
          className={`px-3 py-1.5 text-sm rounded-md border ${
            selectedStatus === 'ANSWERED'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          답변완료{answeredCount > 0 ? ` (${answeredCount})` : ''}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700" htmlFor="inquiry-category-filter">
          문의 유형
        </label>
        <select
          id="inquiry-category-filter"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value as 'ALL' | InquiryCategory);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">전체</option>
          {INQUIRY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={inquiries}
          loading={loading}
          emptyMessage="문의가 없습니다."
          onRowClick={handleOpenDetail}
          pagination={{
            currentPage: page,
            pageSize: limit,
            totalItems: total,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        title="문의 상세 및 답변"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCloseDetail}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={savingAnswer}
            >
              닫기
            </button>
            <button
              onClick={handleSaveAnswer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={savingAnswer || detailLoading || !selectedInquiry}
            >
              {savingAnswer ? '저장 중...' : selectedInquiry?.status === 'ANSWERED' ? '답변 수정 저장' : '답변 저장'}
            </button>
          </div>
        }
      >
        {detailLoading && !selectedInquiry ? (
          <div className="py-8 text-center text-gray-500">상세 정보를 불러오는 중...</div>
        ) : selectedInquiry ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedInquiry.status]}`}
              >
                {STATUS_LABELS[selectedInquiry.status]}
              </span>
              <span className="px-2 py-1 rounded bg-gray-100 text-xs text-gray-700">
                {selectedInquiry.category}
              </span>
              <span className="text-xs text-gray-500">작성: {formatDateTime(selectedInquiry.createdAt)}</span>
              {selectedInquiry.answeredAt && (
                <span className="text-xs text-gray-500">
                  답변: {formatDateTime(selectedInquiry.answeredAt)}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedInquiry.title}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-md p-4">
              <div>
                <p className="text-xs text-gray-500">작성자</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedInquiry.user?.nickname || '-'}
                  {selectedInquiry.user?.isDeleted ? ' (탈퇴)' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm text-gray-900">{selectedInquiry.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">연락처</p>
                <p className="text-sm text-gray-900">{selectedInquiry.user?.phoneNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">카카오 ID</p>
                <p className="text-sm text-gray-900">{selectedInquiry.user?.kakaoId || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">문의 내용</p>
              <div className="whitespace-pre-wrap text-sm text-gray-900 bg-white border border-gray-200 rounded-md p-4 min-h-[100px]">
                {selectedInquiry.content}
              </div>
            </div>

            <div>
              <label htmlFor="inquiry-answer" className="block text-sm font-medium text-gray-700 mb-2">
                관리자 답변
              </label>
              <textarea
                id="inquiry-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                placeholder="답변 내용을 입력하세요. 저장 즉시 사용자 1:1 문의 화면에 표시됩니다."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={savingAnswer}
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">문의 정보를 불러오지 못했습니다.</div>
        )}
      </Modal>
    </div>
  );
};

export default InquiriesPage;
