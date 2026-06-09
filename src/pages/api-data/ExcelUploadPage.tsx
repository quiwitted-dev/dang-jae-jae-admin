import React, { useState, useRef } from 'react';
import { excelApi } from '../../api';

const ExcelUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ processedCount: number; deletedCount: number; ignoredCount: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
    setResult(null);
    setSuccessMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('업로드할 엑셀 파일을 선택해주세요.');
      return;
    }
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }
    if (!confirm(`"${file.name}" 파일을 업로드하시겠습니까?\n처리 중에는 페이지를 닫지 마세요.`)) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSuccessMessage(null);

    try {
      const response = await excelApi.upload(file);
      if (response.success) {
        setSuccessMessage(response.message);
        if (response.details) setResult(response.details);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError('업로드 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || '업로드 중 서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">엑셀 데이터 업로드</h1>
        <p className="text-gray-600 mt-1">서울시 정비사업 엑셀 파일을 업로드하여 데이터를 직접 갱신합니다.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">

        {/* 파일 선택 영역 */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">파일 선택</h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file ? (
              <div>
                <p className="text-sm font-semibold text-blue-600">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-600">클릭하여 엑셀 파일 선택</p>
                <p className="text-xs text-gray-400 mt-1">.xlsx, .xls 파일만 지원</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-semibold">오류</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 성공 메시지 및 결과 */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded">
            <p className="font-semibold">{successMessage}</p>
            {result && (
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 rounded p-3">
                  <div className="text-2xl font-bold text-green-700">{result.processedCount}</div>
                  <div className="text-xs text-green-600 mt-1">처리 완료</div>
                </div>
                <div className="bg-red-100 rounded p-3">
                  <div className="text-2xl font-bold text-red-700">{result.deletedCount}</div>
                  <div className="text-xs text-red-600 mt-1">삭제됨</div>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <div className="text-2xl font-bold text-gray-700">{result.ignoredCount}</div>
                  <div className="text-xs text-gray-600 mt-1">무시/실패</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 업로드 버튼 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors ${
              !file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                업로드 중... (시간이 걸릴 수 있습니다)
              </>
            ) : (
              '업로드 시작'
            )}
          </button>
          {file && !loading && (
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              선택 취소
            </button>
          )}
        </div>

        {/* 안내사항 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">업로드 안내</h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
            <li>서울시 정비사업 엑셀 파일 형식만 지원합니다 (3행부터 데이터 읽기).</li>
            <li>기존 데이터는 사업번호(0번 컬럼) 기준으로 덮어씌워집니다 (Upsert).</li>
            <li>43번 컬럼에 <strong>'o'</strong>가 있는 행은 삭제 처리됩니다.</li>
            <li>업로드 중에는 페이지를 닫지 마세요. 대용량 파일은 수 분이 소요될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadPage;
