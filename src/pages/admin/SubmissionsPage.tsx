import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ActionButton from '../../components/ActionButton';
import type { RenovationPlaceSubmission } from '../../types';

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<RenovationPlaceSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(undefined);
  const [selectedSubmission, setSelectedSubmission] = useState<RenovationPlaceSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [selectedStatus]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getSubmissions(selectedStatus);
      if (response.success && response.submissions) {
        setSubmissions(response.submissions);
      } else {
        setError(response.error || '신청 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('신청 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('이 신청을 승인하시겠습니까?')) return;

    try {
      const response = await adminApi.approveSubmission(id);
      if (response.success) {
        alert('신청이 승인되었습니다.');
        fetchSubmissions();
        setIsDetailModalOpen(false);
      } else {
        alert(response.error || '승인에 실패했습니다.');
      }
    } catch (err) {
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    if (!rejectionReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      const response = await adminApi.rejectSubmission(selectedSubmission.id, rejectionReason);
      if (response.success) {
        alert('신청이 거절되었습니다.');
        fetchSubmissions();
        setIsRejectModalOpen(false);
        setIsDetailModalOpen(false);
        setRejectionReason('');
        setSelectedSubmission(null);
      } else {
        alert(response.error || '거절에 실패했습니다.');
      }
    } catch (err) {
      alert('거절 중 오류가 발생했습니다.');
    }
  };

  const handleViewDetail = (submission: RenovationPlaceSubmission) => {
    setSelectedSubmission(submission);
    setIsDetailModalOpen(true);
  };

  const handleOpenRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof RenovationPlaceSubmission,
      className: 'w-20 max-w-20 truncate',
    },
    {
      header: '임시명',
      accessor: 'tempName' as keyof RenovationPlaceSubmission,
      className: 'max-w-xs truncate',
    },
    {
      header: '위치',
      accessor: 'location' as keyof RenovationPlaceSubmission,
      className: 'max-w-xs truncate',
    },
    {
      header: '사용자',
      accessor: (row: RenovationPlaceSubmission) => row.user?.nickname || '-',
      className: 'truncate',
    },
    {
      header: '상태',
      accessor: 'status' as keyof RenovationPlaceSubmission,
      cell: (value: string) => {
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
        };
        const statusLabels = {
          PENDING: '대기중',
          APPROVED: '승인됨',
          REJECTED: '거절됨',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || ''}`}>
            {statusLabels[value as keyof typeof statusLabels] || value}
          </span>
        );
      },
    },
    {
      header: '신청일',
      accessor: 'createdAt' as keyof RenovationPlaceSubmission,
      cell: (value: string) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      header: '작업',
      accessor: () => null as any,
      cell: (_value: any, row: RenovationPlaceSubmission) => (
        <div className="flex space-x-2 whitespace-nowrap">
          <button
            onClick={() => handleViewDetail(row)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            상세
          </button>
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
              >
                승인
              </button>
              <button
                onClick={() => {
                  setSelectedSubmission(row);
                  handleOpenRejectModal();
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
              >
                거절
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">사업 예정지 신청 관리</h1>
          <p className="text-gray-600 mt-1">사업 예정지 신청을 승인하거나 거절할 수 있습니다.</p>
        </div>
        <ActionButton
          action="refresh"
          label="새로고침"
          onClick={fetchSubmissions}
        />
      </div>

      {/* 필터 */}
      <div className="mb-4 flex space-x-4">
        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value ? (e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED') : undefined)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          <option value="PENDING">대기중</option>
          <option value="APPROVED">승인됨</option>
          <option value="REJECTED">거절됨</option>
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
          data={submissions}
          loading={loading}
          emptyMessage="신청 내역이 없습니다."
          onRowClick={handleViewDetail}
        />
      </div>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="신청 상세 정보"
        size="lg"
        footer={
          selectedSubmission?.status === 'PENDING' ? (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenRejectModal();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                거절
              </button>
              <button
                onClick={() => selectedSubmission && handleApprove(selectedSubmission.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                승인
              </button>
            </div>
          ) : null
        }
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSubmission.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSubmission.status === 'PENDING' ? '대기중' : 
                   selectedSubmission.status === 'APPROVED' ? '승인됨' : '거절됨'}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">임시명</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSubmission.tempName}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">위치</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSubmission.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">사용자</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSubmission.user?.nickname || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">연락처 동의</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSubmission.consentContact || '-'}</p>
              </div>
              {selectedSubmission.priceRange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">가격대</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.priceRange}</p>
                </div>
              )}
              {selectedSubmission.ownerCount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">소유자 수</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.ownerCount}</p>
                </div>
              )}
              {selectedSubmission.expectedNewUnits && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">예상 신규 세대수</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.expectedNewUnits}</p>
                </div>
              )}
              {selectedSubmission.projectArea && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">정비구역면적 (m²)</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.projectArea}</p>
                </div>
              )}
              {selectedSubmission.currentVolumeRatio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">현재 용적률 (%)</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.currentVolumeRatio}</p>
                </div>
              )}
              {selectedSubmission.expectedVolumeRatio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">예상 용적률 (%)</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.expectedVolumeRatio}</p>
                </div>
              )}
              {selectedSubmission.constructionYear && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">건축년도</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.constructionYear}</p>
                </div>
              )}
              {selectedSubmission.mainUsage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">주용도</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.mainUsage}</p>
                </div>
              )}
              {selectedSubmission.usageZone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">용도지역</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.usageZone}</p>
                </div>
              )}
              {selectedSubmission.applicablePolicy && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">적용가능 정책</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedSubmission.applicablePolicy}</p>
                </div>
              )}
              {selectedSubmission.businessEntity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">사업주체</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.businessEntity}</p>
                </div>
              )}
              {selectedSubmission.businessType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">사업성격</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.businessType}</p>
                </div>
              )}
              {selectedSubmission.consentRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">동의율 (%)</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.consentRate}</p>
                </div>
              )}
              {selectedSubmission.notes && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">비고</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedSubmission.notes}</p>
                </div>
              )}
              {selectedSubmission.rejectionReason && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">거절 사유</label>
                  <p className="mt-1 text-sm text-red-600 whitespace-pre-wrap">{selectedSubmission.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 거절 모달 */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectionReason('');
        }}
        title="신청 거절"
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              거절
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거절 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="거절 사유를 입력해주세요."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubmissionsPage;

