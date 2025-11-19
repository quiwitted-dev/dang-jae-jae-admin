'use client';

import { ArrowLeft, Plus, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpectedFormInputs, expectedSchema } from '@/schemas/expectedSchema';
import { postSubmissionUser } from '@/services/submission.api';

const ExpectedAddForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpectedFormInputs>({
    resolver: zodResolver(expectedSchema),
    mode: 'onChange',
  });
  const numberInputClass =
    'text-end text-[20px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (form: ExpectedFormInputs) => {
    try {
      // 서버 통신 (가상 예시)
      await postSubmissionUser(form);
      console.log(form); // 유효성 검사를 통과한 데이터
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      setError('root', { type: 'serverSignupError', message });
    }
  };

  return (
    <div className="max-w-[700px] md:w-[700px] bg-[#A7B1E8] text-black min-h-dvh">
      {/* 헤더 */}
      <div className="flex flex-row items-center justify-between px-4 py-5">
        <button className="cursor-pointer" onClick={handleBack}>
          <ArrowLeft />
        </button>
        <Link href={'/'}>
          <button className="cursor-pointer">
            <X />
          </button>
        </Link>
      </div>
      {/* 본문 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-7 md:w-3/4 px-4 mx-auto"
      >
        <h2 className="text-[28px] font-bold text-center">
          당신의 정보력,
          <br /> 예정지 정보를 제공해 주세요
        </h2>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">가칭*</h3>
            <Input
              {...register('tempName')}
              className="w-3/5 text-end text-[20px]"
              placeholder="서울1구역"
            />
          </div>
          {errors.tempName && <p className="">{errors.tempName.message}</p>}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">위치*</h3>
            <div className="flex flex-row gap-2">
              <div className="items-center">
                <Input
                  {...register('sido')}
                  className="w-[50px] text-end text-[20px]"
                  placeholder="서울"
                />
                시
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('gugun')}
                  className="w-[50px] text-end text-[20px]"
                  placeholder="서울"
                />
                구
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('dong')}
                  className="w-[50px] text-end text-[20px]"
                  placeholder="서울"
                />
                동
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('locationDetail')}
                  className="w-[70px] text-end text-[20px]"
                  placeholder="000-1"
                />
                일대
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] leading-relaxed">
              <strong>
                [중요 안내] 개인정보 게시 관련 책임 고지 <br />
              </strong>
              회원님이 게시물에 기재하는 정보는 게시물을 읽는 다른 이용자에게
              직접 공개됩니다.
              <br />
              1. 게시자의 책임: 타인의 개인정보를 무단으로 게시하거나, 본인의
              정보를 공개하여 발생하는 모든 법적, 금전적 책임은 정보를 게시한
              이용자 본인에게 있습니다. <br />
              2. 플랫폼의 면책: 당사는 이용자가 자발적으로 게시한 개인정보의
              노출 및 오용으로 인해 발생하는 피해나 분쟁에 대해 일체의 책임이
              없으며 면책됩니다.
            </p>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              동의서 징구 안내처
            </h3>
            <Input
              {...register('consentContact')}
              className="w-3/5 text-end text-[20px]"
              placeholder="000-0000-0000"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">가격대(시세)</h3>
            <div className="w-3/5 flex flex-row gap-5 justify-between text-[20px]">
              <div className="flex flex-row items-center gap-3">
                <Input
                  type="number"
                  {...register('minPrice', { valueAsNumber: true })}
                  className={`w-14 ${numberInputClass}`}
                  placeholder="1"
                />
                <p>억</p>
              </div>
              ~
              <div className="flex flex-row items-center gap-3">
                <Input
                  type="number"
                  {...register('maxPrice', { valueAsNumber: true })}
                  className={`w-14 ${numberInputClass}`}
                  placeholder="100"
                />
                <p>억</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">소유자 수</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                type="number"
                {...register('ownerCount', { valueAsNumber: true })}
                className={`w-4/5 ${numberInputClass}`}
                placeholder="000000"
              />
              명
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              기대 신축 세대수
            </h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                type="number"
                {...register('expectedNewUnits', { valueAsNumber: true })}
                className={`w-4/5 ${numberInputClass}`}
                placeholder="000000"
              />
              <p className="shrink-0">세대</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업지 면적</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                type="number"
                {...register('projectArea', { valueAsNumber: true })}
                className={`w-4/5 ${numberInputClass}`}
                placeholder="000000"
              />
              <p className="shrink-0">m2</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">현재 용적률</h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                type="number"
                {...register('currentVolumeRatio', { valueAsNumber: true })}
                className={`w-4/5 ${numberInputClass}`}
                placeholder="200"
              />
              <p className="shrink-0">%</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              미래(기대) 용적률
            </h3>
            <div className="w-3/5 flex flex-row items-center gap-5 text-[20px] justify-between">
              <Input
                type="number"
                {...register('expectedVolumeRatio', { valueAsNumber: true })}
                className={`w-4/5 ${numberInputClass}`}
                placeholder="200"
              />
              <p className="shrink-0">%</p>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">
              건축년도(노후도)
            </h3>
            <div className="w-3/5 flex flex-row items-center gap-3 justify-end text-[20px]">
              <Input
                type="number"
                {...register('constructionYearStart', { valueAsNumber: true })}
                className={`w-20 ${numberInputClass}`}
                placeholder="1980"
              />
              ~
              <Input
                type="number"
                {...register('constructionYearEnd', { valueAsNumber: true })}
                className={`w-20 ${numberInputClass}`}
                placeholder="1988"
              />
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">주용도</h3>
            <Input
              {...register('mainUsage')}
              className="w-3/5 text-end text-[20px]"
              placeholder="공공주택"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">용도지역</h3>
            <Input
              {...register('usageZone')}
              className="w-3/5 text-end text-[20px]"
              placeholder="3종일반주거"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">적용가능 정책*</h3>
            <Input
              {...register('applicablePolicy')}
              className="w-3/5 text-end text-[20px]"
              placeholder="역세권특별법"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업주체*</h3>
            <Input
              {...register('businessEntity')}
              className="w-3/5 text-end text-[20px]"
              placeholder="조합"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업성격*</h3>
            <Input
              {...register('businessType')}
              className="w-3/5 text-end text-[20px]"
              placeholder="재개발"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">동의율</h3>
            <div className="flex flex-row gap-2 justify-end items-center">
              대략 ~
              <Input
                {...register('consentRateStr')}
                className="w-1/5 text-end text-[20px]"
                placeholder="40"
              />
              %
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">기타사항</h3>
            <Input
              {...register('notes')}
              className="w-3/5 text-end text-[20px]"
              placeholder="재개발"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">작성자 성함</h3>
            <p className="w-3/5 text-end text-[20px]">홍길동</p>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">작성자 연락처</h3>
            <p className="w-3/5 text-end text-[20px]">010-1234-5678</p>
          </div>
        </div>
        <Button
          className="text-[25px] font-semibold rounded-full p-2 px-10 mb-7"
          size={'none'}
          type="submit"
        >
          {isSubmitting ? (
            '제출중...'
          ) : (
            <>
              <Plus /> 예정지 추가하기
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
export default ExpectedAddForm;
