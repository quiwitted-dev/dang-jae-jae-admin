import React, { useState } from 'react';
import { apiDataApi } from '../../api';
import ActionButton from '../../components/ActionButton';

const ApiDataSyncPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSync = async () => {
    if (!confirm('공공데이터를 동기화하시겠습니까?\n이 작업은 시간이 걸릴 수 있습니다.')) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setSyncResult(null);

    try {
      const response = await apiDataApi.sync();
      if (response.success) {
        setSuccess(true);
        setSyncResult('공공데이터 동기화가 완료되었습니다.');
      } else {
        setError(response.error || '동기화에 실패했습니다.');
      }
    } catch (err) {
      setError('동기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">데이터 동기화</h1>
        <p className="text-gray-600 mt-1">공공데이터를 동기화하여 최신 정보를 가져옵니다.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">공공데이터 동기화</h2>
            <p className="text-sm text-gray-600 mb-4">
              서울시, 경기도 일반정비, 경기도 가로정비 데이터를 동기화합니다.
              <br />
              이 작업은 시간이 걸릴 수 있으며, 서버에 부하를 줄 수 있습니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && syncResult && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
              <p>{syncResult}</p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <ActionButton
              action="refresh"
              label="동기화 시작"
              onClick={handleSync}
              disabled={loading}
            />
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-gray-600">동기화 중...</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 mt-3">동기화 안내</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>동기화는 서울시, 경기도 일반정비, 경기도 가로정비 데이터를 가져옵니다.</li>
              <li>동기화 중에는 페이지를 닫지 마세요.</li>
              <li>동기화는 서버에 부하를 줄 수 있으므로 필요한 경우에만 실행하세요.</li>
              <li>동기화가 완료되면 데이터가 자동으로 업데이트됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDataSyncPage;

