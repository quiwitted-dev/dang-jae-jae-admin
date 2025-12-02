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
import { SeoulSubmissionDetail } from '@/types/submission.type';
import useCompareStore from '@/store/useCompareStore';
import { postPrice } from '@/services/price.api';
import useAuthStore from '@/store/useAuthStore';
import {
  deleteBookmark,
  getBookmark,
  postBookmark,
} from '@/services/bookmark.api';
import useStore from '@/store/useStore';
import { useQueryParams } from '@/lib/useQueryParams';

type SeoulSideBarProps = {
  publicData: SeoulSubmissionDetail;
};

const SeoulSideBar = ({ publicData }: SeoulSideBarProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [minimumInitialInvestment, setMinimumInitialInvestment] = useState('');
  const [currentBookmarkId, setCurrentBookmarkId] = useState<
    string | undefined
  >(undefined);
  const [premium, setPremium] = useState('');
  const { setCompare } = useCompareStore();
  const { isLogin } = useAuthStore();
  const { toggleOpen, setAddress } = useStore();
  const router = useRouter();
  const { id } = publicData;
  const query = useQueryParams();
  const { type, ...restQuery } = query;

  const projectArea = Number(publicData.projectAreaM2);
  const ownerCount = Number(publicData.ownerCount);
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
    setAddress(`${publicData.district} ${publicData.representativeLotNumber}`);
  }, []);

  const handleGoHome = () => {
    const qs = new URLSearchParams({
      ...restQuery,
    }).toString();
    console.log(qs);
    router.push(`/?${qs}`);
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
      minimumInitialInvestment,
      premium,
    };

    try {
      const data = await postPrice({
        referenceId,
        dataType: 'PUBLIC_DATA',
        form,
      });
      if (data.success) {
        alert('가격 입력이 확인되었습니다.');
        setIsEdit(false);
        setMaxPrice('');
        setMinPrice('');
        setMinimumInitialInvestment('');
        setPremium('');
      }
    } catch (error) {
      alert((error as Error).message);
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
        const created = await postBookmark(publicData.id, 'PUBLIC_DATA');
        // post 응답에 id가 없을 때를 대비해 리스트 재조회로 보정
        let newId = created?.data?.id ?? created?.id;
        if (!newId) {
          const { favorites } = await getBookmark();
          const found = favorites?.find(
            (fav: any) =>
              fav.referenceId === publicData.id || fav.id === publicData.id
          );
          newId = found?.id ?? publicData.id;
        }
        setCurrentBookmarkId(newId);
        setIsFavorite(true);
      } else {
        const target = currentBookmarkId ?? publicData.id;
        const data = await deleteBookmark(target);
        if (!data) throw new Error('삭제 실패');
        setIsFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    } catch (err) {
      console.error(err);
      alert((err as Error).message); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-linear-to-b from-[#F8F4F1] via-[rgb(242,236,251)] to-[#F1E6E6] max-w-[700px] md:w-[700px] text-black min-h-dvh">
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <div className="flex flex-row gap-4 text-[18px] font-bold">
          <button onClick={handleGoHome} className="cursor-pointer">
            <ArrowLeft />
          </button>
          {publicData.renovationZoneName}
        </div>
        <button onClick={handleGoHome} className="cursor-pointer">
          <X />
        </button>
      </div>
      <div className="flex max-w-[400px] mx-auto">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-3xl font-normal">
            <h3>
              일반분양 세대수 <span className="font-extrabold">-</span> 세대
            </h3>
            <h3>
              평균 대지지분{' '}
              <span className="font-extrabold">{average_land_share}</span>평
            </h3>
            <h3>
              진행단계{' '}
              <span className="font-extrabold">{publicData.currentStage}</span>
            </h3>
          </div>

          <div className="flex flex-row gap-3">
            <Button
              className="rounded-full"
              onClick={(e) => {
                handleToggleBookmark(publicData.id);
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
                setCompare({ id, dataType: 'PUBLIC' });
                alert('비교하기에 담았습니다');
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
              <span className="text-gray-700">{` - 님이 올려주신 시세입니다.`}</span>
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
                    placeholder={publicData.renovationPrice?.minPrice ?? '0'}
                    required
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                    }}
                  />
                ) : (
                  <span className="font-playfair">
                    {publicData.renovationPrice?.minPrice ?? '0'}
                  </span>
                )}
                억
              </div>
              <p>~</p>
              <div className="flex flex-row items-center">
                {isEdit ? (
                  <Input
                    className="text-right"
                    placeholder={publicData.renovationPrice?.maxPrice ?? '0'}
                    required
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                    }}
                  />
                ) : (
                  <span className="font-playfair">
                    {publicData.renovationPrice?.maxPrice ?? '0'}
                  </span>
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

              <div className="flex flex-row text-[14px] font-semibold justify-between items-center border-b border-b-gray py-2">
                <p>최소 초기 투자금</p>
                <div className="flex flex-row items-end">
                  {isEdit ? (
                    <Input
                      className="text-right"
                      placeholder={
                        publicData.renovationPrice?.minimumInitialInvestment ??
                        '0'
                      }
                      required
                      onChange={(e) => {
                        setMinimumInitialInvestment(e.target.value);
                      }}
                    />
                  ) : (
                    <span className="font-playfair">
                      {publicData.renovationPrice?.minimumInitialInvestment ??
                        '0'}
                    </span>
                  )}
                  억
                </div>
              </div>
              <div className="flex flex-row text-[14px] font-semibold justify-between items-center">
                <p className="whitespace-nowrap">프리미엄(P)</p>
                <div className="flex flex-row items-end">
                  {isEdit ? (
                    <Input
                      className="text-right"
                      placeholder={publicData.renovationPrice?.premium ?? '0'}
                      required
                      onChange={(e) => {
                        setPremium(e.target.value);
                      }}
                    />
                  ) : (
                    <span className="font-playfair">
                      {publicData.renovationPrice?.premium ?? '0'}
                    </span>
                  )}
                  억
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

          <div className="mt-6 px-5 md:px-0">
            <div className="mb-4 text-sm font-normal text-[#49454F]">
              <div>
                <p>
                  주용도 :{' '}
                  <span className="text-black">
                    {publicData.mainUsage ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  기타 : <span>-</span>
                </p>
                <p className="font-bold">
                  용적률{' '}
                  <span className="text-black font-extrabold">
                    {publicData.volumeRatio ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                {/* 용도지역 예)제3종 일반주거지역 */}
                <p className="text-black font-bold">-</p>
                <p className="font-bold">
                  건폐율{' '}
                  <span className="text-black font-extrabold">
                    {publicData.buildingCoverageRatio ?? '-'}
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  소유자수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.ownerCount ?? '-'}
                  </span>{' '}
                  세대
                </p>
                <ArrowRight />
                <p>
                  분양세대수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.totalSaleUnits ?? '-'}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  정비구역면적 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.projectAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </p>
                <p>
                  임대 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.rentalUnits ?? '-'}
                  </span>{' '}
                  세대
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>
                  신축 지상층수 :{' '}
                  <span className="text-black font-extrabold">
                    {publicData.newConstructionFloors ?? '-'}
                  </span>{' '}
                  층
                </p>
              </div>
            </div>

            <div className="text-sm text-black mb-4 whitespace-normal break-keep">
              <p>
                본 서비스에서 사용된 데이터는 서울시 공공누리 제1유형으로 개방한
                공공저작물을 활용하였으며, 해당 저작물의 원본출처는 [정비사업
                정보몽땅] 입니다.
              </p>
              <p className="text-gray-600">
                공공데이터의 정보와 실제 진행 현황과 차이가 있을 수 있습니다.
                제공된 정보의 정확성 여부와 무관하게, 이를 이용한 투자 결과에
                대한 책임은 전적으로 이용자에게 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 w-full">
              <div>
                <div>
                  택지면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.residentialLandAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  공원면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.parkAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  공공공지{' '}
                  <span className="text-black font-extrabold">
                    {publicData.publicOpenSpaceAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
                <div>
                  기타면적{' '}
                  <span className="text-black font-extrabold">
                    {publicData.otherAreaM2 ?? '-'}
                  </span>{' '}
                  m²
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div>도로면적 - m²</div>
                <div>녹지면적 - m²</div>
                <div>학교면적 - m²</div>
              </div>
            </div>

            <div className="mb-4">
              <div>
                60m²이하{' '}
                <span className="font-bold">
                  {publicData.unitsUnder60M2 ?? '-'}
                </span>{' '}
                세대
              </div>
              <div>
                60m²초과~85m²이하{' '}
                <span className="font-bold">
                  {publicData.units60To85M2 ?? '-'}
                </span>{' '}
                세대
              </div>
              <div>
                85m²초과{' '}
                <span className="font-bold">
                  {publicData.unitsOver85M2 ?? '-'}
                </span>{' '}
                세대
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoulSideBar;
