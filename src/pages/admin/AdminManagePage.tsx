import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ActionButton from '../../components/ActionButton';
import type { Admin } from '../../types';

const AdminManagePage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getList({ page, limit });
      if (response.success && response.admins) {
        setAdmins(response.admins);
        if (response.pagination) {
          setTotal(response.pagination.total);
        }
      } else {
        setError(response.error || '관리자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('관리자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.nickname || !formData.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await adminApi.create(formData.email, formData.nickname, formData.password);
      if (response.success) {
        alert('관리자가 생성되었습니다.');
        fetchAdmins();
        setIsCreateModalOpen(false);
        setFormData({ email: '', nickname: '', password: '' });
      } else {
        alert(response.error || '관리자 생성에 실패했습니다.');
      }
    } catch (err) {
      alert('관리자 생성 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;
    if (!formData.email && !formData.nickname && !formData.password) {
      alert('수정할 항목을 입력해주세요.');
      return;
    }

    try {
      const response = await adminApi.update(selectedAdmin.id, {
        email: formData.email || undefined,
        nickname: formData.nickname || undefined,
        password: formData.password || undefined,
      });
      if (response.success) {
        alert('관리자 정보가 수정되었습니다.');
        fetchAdmins();
        setIsEditModalOpen(false);
        setFormData({ email: '', nickname: '', password: '' });
        setSelectedAdmin(null);
      } else {
        alert(response.error || '관리자 수정에 실패했습니다.');
      }
    } catch (err) {
      alert('관리자 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await adminApi.delete(selectedAdmin.id);
      if (response.success) {
        alert('관리자가 삭제되었습니다.');
        fetchAdmins();
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);
      } else {
        alert(response.error || '관리자 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ email: '', nickname: '', password: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({ email: admin.email, nickname: admin.nickname, password: '' });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof Admin,
      className: 'w-20 max-w-20 truncate',
    },
    {
      header: '이메일',
      accessor: 'email' as keyof Admin,
      className: 'max-w-xs truncate',
    },
    {
      header: '닉네임',
      accessor: 'nickname' as keyof Admin,
      className: 'max-w-xs truncate',
    },
    {
      header: '생성일',
      accessor: 'createdAt' as keyof Admin,
      className: 'w-32',
      cell: (value: string) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      header: '수정일',
      accessor: 'updatedAt' as keyof Admin,
      className: 'w-32',
      cell: (value: string) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      header: '작업',
      accessor: () => null as any,
      cell: (_value: any, row: Admin) => (
        <div className="flex space-x-2 whitespace-nowrap">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            수정
          </button>
          <button
            onClick={() => handleOpenDeleteModal(row)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">관리자 계정 관리</h1>
          <p className="text-gray-600 mt-1">관리자 계정을 생성, 수정, 삭제할 수 있습니다.</p>
        </div>
        <div className="flex space-x-2">
          <ActionButton
            action="add"
            label="관리자 추가"
            onClick={handleOpenCreateModal}
          />
          <ActionButton
            action="refresh"
            label="새로고침"
            onClick={fetchAdmins}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          emptyMessage="관리자가 없습니다."
          onRowClick={handleOpenEditModal}
          pagination={{
            currentPage: page,
            pageSize: limit,
            totalItems: total,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>

      {/* 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ email: '', nickname: '', password: '' });
        }}
        title="관리자 추가"
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ email: '', nickname: '', password: '' });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              생성
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="닉네임을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({ email: '', nickname: '', password: '' });
          setSelectedAdmin(null);
        }}
        title="관리자 수정"
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setFormData({ email: '', nickname: '', password: '' });
                setSelectedAdmin(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              수정
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="닉네임을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 (변경 시에만 입력)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>
      </Modal>

      {/* 삭제 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAdmin(null);
        }}
        title="관리자 삭제"
        size="md"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedAdmin(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              삭제
            </button>
          </div>
        }
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <p className="text-gray-700">
              정말로 <strong>{selectedAdmin.nickname}</strong> 관리자를 삭제하시겠습니까?
            </p>
            <p className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminManagePage;

