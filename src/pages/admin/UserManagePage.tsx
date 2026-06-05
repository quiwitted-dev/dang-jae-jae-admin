import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ActionButton from '../../components/ActionButton';
import type { User } from '../../types';

const UserManagePage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getUsers({
                keyword,
                page,
                limit
            });
            if (response.success && response.users) {
                setUsers(response.users);
                if (response.pagination) {
                    setTotal(response.pagination.total);
                }
            } else {
                setError(response.error || '유저 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('유저 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // 검색 시 첫 페이지로 이동
        fetchUsers();
    };

    const handleWithdraw = async (id: string) => {
        if (!confirm('정말로 이 유저를 탈퇴 처리하시겠습니까?\n탈퇴 시 해당 유저는 재가입이 차단됩니다.')) return;

        try {
            const response = await adminApi.withdrawUser(id);
            if (response.success) {
                alert('유저가 성공적으로 탈퇴 처리되었습니다.');
                fetchUsers();
                setIsDetailModalOpen(false);
            } else {
                alert(response.error || '탈퇴 처리에 실패했습니다.');
            }
        } catch (err) {
            alert('탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id' as keyof User,
            className: 'w-20 max-w-20 truncate',
        },
        {
            header: '닉네임',
            accessor: 'nickname' as keyof User,
            className: 'font-medium text-gray-900',
        },
        {
            header: '이메일',
            accessor: 'email' as keyof User,
            cell: (value: string) => value || '-',
        },
        {
            header: '연락처',
            accessor: 'phoneNumber' as keyof User,
            cell: (value: string) => value || '-',
        },
        {
            header: '가입일',
            accessor: 'createdAt' as keyof User,
            cell: (value: string) => new Date(value).toLocaleDateString('ko-KR'),
        },
        {
            header: '작업',
            accessor: () => null as any,
            cell: (_value: any, row: User) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(row);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                >
                    상세
                </button>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">유저 관리</h1>
                </div>
                <ActionButton
                    action="refresh"
                    label="새로고침"
                    onClick={fetchUsers}
                />
            </div>

            {/* 검색 바 */}
            <form onSubmit={handleSearch} className="mb-6 flex space-x-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="닉네임 또는 이메일 검색"
                    className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    검색
                </button>
            </form>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="가입된 유저가 없습니다."
                    onRowClick={handleViewDetail}
                    pagination={{
                        currentPage: page,
                        pageSize: limit,
                        totalItems: total,
                        onPageChange: (newPage) => setPage(newPage),
                    }}
                />
            </div>

            {/* 상세 모달 */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedUser(null);
                }}
                title="유저 상세 정보"
                size="md"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => selectedUser && handleWithdraw(selectedUser.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            탈퇴 처리
                        </button>
                        <button
                            onClick={() => {
                                setIsDetailModalOpen(false);
                                setSelectedUser(null);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            닫기
                        </button>
                    </div>
                }
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">카카오 ID</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.kakaoId}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">닉네임</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.nickname}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">이메일</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.email || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">연락처</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.phoneNumber || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">가입일</label>
                                <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleString('ko-KR')}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">최근 수정일</label>
                                <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.updatedAt).toLocaleString('ko-KR')}</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-md">
                            <h4 className="text-sm font-bold text-red-800 mb-1">주의: 강제 탈퇴 처리</h4>
                            <p className="text-xs text-red-700">
                                탈퇴 처리 시 해당 유저의 세션이 만료되며, 동일한 카카오 계정으로는 재가입이 불가능하도록 차단됩니다.
                                이 작업은 되돌릴 수 없으니 신중하게 결정해 주세요.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagePage;
