'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  Check,
  Pencil,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { SubmissionUserDetail } from '@/types/submission.type';
import useCompareStore from '@/store/useCompareStore';
import { postPrice } from '@/services/price.api';
import useAuthStore from '@/store/useAuthStore';
import {
  deleteBookmark,
  getBookmark,
  postBookmark,
} from '@/services/bookmark.api';
import useStore from '@/store/useStore';

const SubmissionUserSideBar = ({
  submissionData,
}: {
  submissionData: SubmissionUserDetail;
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [popup, setPopup] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<
    string | undefined
  >(undefined);
  const { setCompare } = useCompareStore();
  const { isLogin } = useAuthStore();
  const { toggleOpen, setAddress } = useStore();
  const router = useRouter();
  const { id } = submissionData;

  const projectArea = Number(submissionData.projectArea);
  const ownerCount = Number(submissionData.ownerCount);
  const average_land_share =
    projectArea > 0 && ownerCount > 0
      ? ((projectArea / ownerCount) * 0.3025).toFixed(2)
      : '-';

  useEffect(() => {
    (async () => {
      const data = await getBookmark();
      const favorite = data.favorites.find((item) => item.referenceId === id);
      if (favorite) {
        setIsFavorite(true);
        setCurrentBookmarkId(favorite.id);
      } else {
        setIsFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    })();
    setAddress(submissionData.location);
  }, []);

  const [min, max] = submissionData.priceRange.match(/\d+/g) || [];

  const handleGoHome = () => {
    router.push('/');
  };

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const referenceId = id;

    const form = {
      minPrice,
      maxPrice,
    };

    try {
      const data = await postPrice({
        referenceId,
        dataType: 'SUBMISSION',
        form,
      });
      if (data.success) {
        alert('가격 입력이 확인되었습니다.');
        setIsEdit(false);
        setMaxPrice('');
        setMinPrice('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    if (loading) return;
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      toggleOpen();
      return;
    }

    setLoading(true);

    try {
      if (!isFavorite) {
        const created = await postBookmark(submissionData.id, 'SUBMISSION');
        // post 응답에 id가 없을 때를 대비해 리스트 재조회로 보정
        let newId = created?.data?.id ?? created?.id;
        if (!newId) {
          const { favorites } = await getBookmark();
          const found = favorites?.find(
            (fav: any) =>
              fav.referenceId === submissionData.id ||
              fav.id === submissionData.id
          );
          newId = found?.id ?? submissionData.id;
        }
        setCurrentBookmarkId(newId);
        setIsFavorite(true);
      } else {
        const target = currentBookmarkId ?? submissionData.id;
        const data = await deleteBookmark(target);
        if (!data) throw new Error('삭제 실패');
        setIsFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    } catch (err) {
      console.error(err);
      alert('북마크 요청이 실패했습니다.'); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-linear-to-b from-[#A1ACEB] to-[#FFFEB1] max-w-[700px] md:w-[700px] text-black min-h-dvh">
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <div className="flex flex-row gap-4 text-[18px] font-bold">
          <button onClick={handleGoHome} className="cursor-pointer">
            <ArrowLeft />
          </button>
          {submissionData.tempName}
        </div>
        <button onClick={handleGoHome} className="cursor-pointer">
          <X />
        </button>
      </div>
      <div className="flex max-w-[400px] mx-auto">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-3xl font-normal">
            <p className="font-bold text-red-600 text-base">
              *예정지*로 하기사항 전부가 불확실 합니다.
            </p>
            <h3>
              기대 신축 세대수{' '}
              <span className="font-extrabold">
                {submissionData.expectedNewUnits}
              </span>{' '}
              세대
            </h3>
            <h3>
              평균 대지지분{' '}
              <span className="font-extrabold">{average_land_share}</span>평
            </h3>
            <h3>
              가능성{' '}
              <span className="font-extrabold">
                {submissionData.applicablePolicy}
              </span>
            </h3>
          </div>

          <div className="flex flex-row gap-3">
            <Button
              className="rounded-full"
              onClick={(e) => {
                handleToggleBookmark(submissionData.id);
              }}
            >
              {isFavorite ? (
                <BookmarkIcon fill="white" size={16} />
              ) : (
                <BookmarkIcon size={16} />
              )}
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                setCompare({ id, dataType: 'SUBMISSON' });
                alert('비교하기에 담았습니다.');
              }}
            >
              비교담기
            </Button>
          </div>

          <div className="flex flex-row gap-4 px-5 md:px-0">
            <h4 className="text-[20px] font-bold whitespace-nowrap">
              요즘시세
            </h4>
            <p className="text-xs font-medium text-gray-500 whitespace-pre-line break-keep">
              <span className="text-gray-700">{`-님이 올려주신 시세입니다.`}</span>
              {`\n시세의 대략적인 정보이며 사용자 누구나 올리실 수 있습니다. 당신의 정보력을 보여주세요!`}
            </p>
          </div>

          <form
            id="price-form"
            className="border-2 relative border-black rounded-4xl flex flex-row p-3 gap-8 mx-2 md:mx-0"
            onSubmit={handleSave}
          >
            <div
              className="absolute -top-5 left-5 w-7 h-7 bg-black rounded-full flex items-center justify-center cursor-pointer"
              onClick={handleEdit}
            >
              <Pencil className="text-white" size={15} />
            </div>
            <div className="text-[40px] font-normal text-center">
              <div className="flex flex-row items-center">
                {isEdit ? (
                  <Input
                    className="text-right"
                    placeholder=""
                    required
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                    }}
                  />
                ) : (
                  <span className="font-playfair">{min}</span>
                )}
                억
              </div>
              <p>~</p>
              <div className="flex flex-row items-center">
                {isEdit ? (
                  <Input
                    className="text-right"
                    placeholder=""
                    required
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                    }}
                  />
                ) : (
                  <span className="font-playfair">{max}</span>
                )}
                억
              </div>
            </div>

            <div className="flex flex-col justify-around">
              {isEdit ? (
                <p className="text-xs font-medium text-gray-500 whitespace-normal break-keep">
                  현재 구역의 전반적인 시세를 알려주세요~! 억 단위이며 천단위는
                  반올림 해주세요. <br />
                  <span className="text-red-600">빨간색은 필수</span>입니다.
                </p>
              ) : (
                <p className="text-xs font-medium text-gray-500 whitespace-normal break-keep">
                  사용자가 게시한 대략적인 <strong>시세정보</strong>이며 매물
                  별로 크게 상이할 수 있고,{' '}
                  <strong className="text-gray-700">
                    참고 목적으로만 제공됩니다.
                  </strong>{' '}
                  당신의재재는 시세내용의 정확성을 보증하지 않습니다.
                </p>
              )}

              <div className="flex flex-row text-base font-semibold justify-between items-center py-2">
                <p>동의율</p>
                <div className="flex flex-row items-end">
                  {/* {isEdit ? (
                    <Input className="text-right" placeholder="" required />
                  ) : (
                  )} */}
                  <span>{submissionData.consentRate} %</span>
                </div>
              </div>
            </div>
          </form>
          {isEdit && (
            <Button
              className="rounded-4xl font-medium items-center flex flex-row cursor-pointer"
              type="submit"
              form="price-form"
            >
              <Check />
              완료
            </Button>
          )}

          <div className="mt-6 px-5 md:px-0 w-full">
            <div className="mb-4 text-sm font-normal text-[#49454F]">
              <div>
                <p>
                  주용도 :{' '}
                  <span className="text-black">
                    {submissionData.mainUsage ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  기타 :{' '}
                  <span className="text-black font-semibold">
                    {submissionData.notes ?? '-'}
                  </span>
                </p>
                <p className="font-bold">
                  현재 용적률{' '}
                  <span className="text-black font-extrabold">
                    {Number(submissionData.currentVolumeRatio).toFixed(2) ??
                      '-'}{' '}
                    %
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-black font-bold">
                  {submissionData.usageZone}
                </p>
                <p>
                  미래용적률{' '}
                  <span className="text-black font-bold">
                    {submissionData.expectedVolumeRatio}
                  </span>{' '}
                  %
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  소유자수 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.ownerCount ?? '-'}
                  </span>{' '}
                  세대
                </p>
                <ArrowRight />
                <p>
                  신축세대수 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.expectedNewUnits}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  정비구역면적 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.projectArea}
                  </span>{' '}
                  m²
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  노후도 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.constructionYear}년도 건축물
                  </span>{' '}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  사업주체 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.businessEntity}
                  </span>{' '}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  사업성격 :{' '}
                  <span className="text-black font-extrabold">
                    {submissionData.businessType}
                  </span>{' '}
                </p>
              </div>
            </div>

            <div className="text-sm text-red-600 mb-4 whitespace-normal break-keep">
              <p>
                사용자가 작성한 정보로 틀릴 수 있습니다.
                <br />
                구역확정이 되며 크게 변경될 수 있습니다.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant={'default'}
                size={'none'}
                className="text-yellow-200 bg-gray-400 py-4 px-6 rounded-4xl mx-auto cursor-pointer"
                onClick={() => setPopup(true)}
              >
                동의서 안내
              </Button>
            </div>
            {/* todo : 전문가 분석 레포트 */}
            <div></div>

            {/* footer */}
            <div className="flex flex-col text-[10px] text-gray-500 gap-5 my-16">
              <strong>당신의재건축재개발</strong>
              <div>
                <div className="flex flex-row gap-2">
                  {/* todo : 링크 달기 */}
                  <p>개인정보 처리방침</p>|<p>약관 및 정책</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>경기도 용인시 수지구 용구대로 2790번길 7</p>|
                  <p>APP고객센터 : jajattok@gmail.com</p>
                </div>
              </div>
              <p>© 2025 당신의재재 All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {popup && (
        <div
          className="absolute flex inset-0 bg-gray-100/50 items-center justify-center"
          onClick={() => setPopup(false)}
        >
          <ApprovePopup phoneNumber={submissionData.consentContact} />
        </div>
      )}
    </div>
  );
};

export default SubmissionUserSideBar;
// todo  : 동의서 팝업 만들어야 함.
export const ApprovePopup = ({ phoneNumber }: { phoneNumber: string }) => {
  return (
    <div className="flex flex-col bg-white rounded-3xl text-black max-w-[390px] p-6">
      <p className="text-base font-semibold">
        동의서 징구 안내처 전화번호 입니다.
      </p>
      <p className="mx-auto text-lg font-bold">{phoneNumber}</p>
      <p className="whitespace-normal break-keep text-gray-600 text-xs font-semibold">
        이 정보는 다른 회원님이 올려주신 정보이며, 저희 [당신의재재]가
        확인하거나 보증한 내용이 아닙니다. [당신의재재]는 해당 정보제공으로
        어떠한 금전적 요구나 이득을 취하지 않습니다.
      </p>
    </div>
  );
};
