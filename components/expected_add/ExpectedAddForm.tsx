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
import { ChangeEvent, useEffect, useState } from 'react';
import { getUser } from '@/services/user.api.client';
import { User } from '@/types/user.type';
import useStore from '@/store/useStore';
import useAuthStore from '@/store/useAuthStore';

const ExpectedAddForm = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
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

  useEffect(() => {
    (async () => {
      const res = await getUser();
      setUser(res);
      if (!res) {
        alert('로그인이 필요한 서비스입니다.');
        router.push('/');
      }
    })();
  }, []);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (
    event: ChangeEvent<HTMLInputElement>,
    field: 'phone' | 'consentContact'
  ) => {
    const formatted = formatPhoneNumber(event.target.value);
    event.target.value = formatted;
    setValue(field, formatted, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (form: ExpectedFormInputs) => {
    if (!user) {
      alert('로그인이 필요합니다.');
    }
    try {
      const data = await postSubmissionUser(form);
      if (data.success) {
        alert('등록이 완료되었습니다.');
        router.push('/');
      }
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
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="서울1구역"
            />
          </div>
          {errors.tempName && (
            <p className="text-red-600">{errors.tempName.message}</p>
          )}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">위치*</h3>
            <div className="flex flex-row gap-2">
              <div className="items-center">
                <Input
                  {...register('sido')}
                  className="w-[50px] text-end text-[20px] bg-white"
                  placeholder="서울"
                />
                시
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('gugun')}
                  className="w-[50px] text-end text-[20px] bg-white"
                  placeholder="서울"
                />
                구
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('dong')}
                  className="w-[50px] text-end text-[20px] bg-white"
                  placeholder="서울"
                />
                동
              </div>
              <div className="flex flex-row items-center">
                <Input
                  {...register('locationDetail')}
                  className="w-[70px] text-end text-[20px] bg-white"
                  placeholder="000-1"
                />
                일대
              </div>
            </div>
          </div>
          {(errors.sido ||
            errors.gugun ||
            errors.dong ||
            errors.locationDetail) && (
            <p className="text-red-600">위치를 작성해주세요</p>
          )}
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
              {...register('consentContact', {
                onChange: (event) => handlePhoneChange(event, 'consentContact'),
              })}
              className="w-3/5 text-end text-[20px] bg-white"
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
                  className={`w-14 ${numberInputClass} bg-white`}
                  placeholder="1"
                />
                <p>억</p>
              </div>
              ~
              <div className="flex flex-row items-center gap-3">
                <Input
                  type="number"
                  {...register('maxPrice', { valueAsNumber: true })}
                  className={`w-14 ${numberInputClass} bg-white`}
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
                className={`w-4/5 ${numberInputClass} bg-white`}
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
                className={`w-4/5 ${numberInputClass} bg-white`}
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
                className={`w-4/5 ${numberInputClass} bg-white`}
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
                className={`w-4/5 ${numberInputClass} bg-white`}
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
                className={`w-4/5 ${numberInputClass} bg-white`}
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
                className={`w-20 ${numberInputClass} bg-white`}
                placeholder="1980"
              />
              ~
              <Input
                type="number"
                {...register('constructionYearEnd', { valueAsNumber: true })}
                className={`w-20 ${numberInputClass} bg-white`}
                placeholder="1988"
              />
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">주용도</h3>
            <Input
              {...register('mainUsage')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="공공주택"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">용도지역</h3>
            <Input
              {...register('usageZone')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="3종일반주거"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">적용가능 정책*</h3>
            <Input
              {...register('applicablePolicy')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="역세권특별법"
            />
          </div>
          {errors.applicablePolicy && (
            <p className="text-red-600">{errors.applicablePolicy.message}</p>
          )}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업주체*</h3>
            <Input
              {...register('businessEntity')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="조합"
            />
          </div>
          {errors.businessEntity && (
            <p className="text-red-600">{errors.businessEntity.message}</p>
          )}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">사업성격*</h3>
            <Input
              {...register('businessType')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="재개발"
            />
          </div>
          {errors.businessType && (
            <p className="text-red-600">{errors.businessType.message}</p>
          )}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">동의율</h3>
            <div className="flex flex-row gap-2 justify-end items-center">
              대략 ~
              <Input
                {...register('consentRateStr')}
                className="w-1/5 text-end text-[20px] bg-white"
                placeholder="40"
              />
              %
            </div>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">기타사항</h3>
            <Input
              {...register('notes')}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="재개발"
            />
          </div>
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">작성자 성함*</h3>
            <Input
              {...register('name')}
              className="w-3/5 text-end text-[20px] bg-white"
              defaultValue={user?.nickname}
              placeholder={user?.nickname || '이름'}
            />
          </div>
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
          <div className="flex flex-row justify-between gap-5">
            <h3 className="text-[20px] font-medium shrink-0">작성자 연락처*</h3>
            <Input
              {...register('phone', {
                onChange: (event) => handlePhoneChange(event, 'phone'),
              })}
              className="w-3/5 text-end text-[20px] bg-white"
              placeholder="전화번호"
            />
          </div>
          {errors.phone && (
            <p className="text-red-600">{errors.phone.message}</p>
          )}

          <div className="flex flex-col whitespace-normal break-keep text-[10px]">
            <h3 className="font-bold">[게시물 작성 전 반드시 확인하세요]</h3>
            <p className="whitespace-pre-line break-keep mb-2">
              회원님이 작성하시는 이 게시물의 모든 내용과 책임은 작성자 본인에게
              있습니다.
            </p>
            <div className="flex flex-row">
              <p>1. </p>
              <p>
                책임 : 타인의 명예훼손, 저작권 및 기타 권리 침해 등 게시물로
                인해 발생하는 모든 법적, 금전적 책임은 오직 작성자 본인에게
                귀속되며, 저희 당신의재재는 면책됩니다.
              </p>
            </div>
            <div className="flex flex-row">
              <p>2. </p>
              <p>
                정보제공 : 게시 내용과 관련하여 수사기관 등으로부터 **법적
                요청(영장, 공문 등)**을 받을 경우, 회사는 관련 법령에 따라
                **작성자의 개인정보(성명, 연락처, 접속 기록 등)**를 제공할 수
                있습니다.
              </p>
            </div>
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
