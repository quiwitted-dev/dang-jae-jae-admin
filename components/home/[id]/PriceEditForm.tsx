'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postPrice } from '@/services/price.api';
import {
  GyeonggiSubmissionDetail,
  SeoulSubmissionDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';
import { Check, Pencil, X } from 'lucide-react';
import React, { useState } from 'react';

type Props =
  | {
      type: 'PUBLIC_DATA';
      data: SeoulSubmissionDetail | GyeonggiSubmissionDetail;
      min?: string;
      max?: string;
    }
  | {
      type: 'SUBMISSION';
      data: SubmissionUserDetail;
      min: string | undefined;
      max: string | undefined;
    };

const PriceEditForm = ({ data, type, min, max }: Props) => {
  const [isEdit, setIsEdit] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [minimumInitialInvestment, setMinimumInitialInvestment] = useState<
    string | null
  >(null);
  const [premium, setPremium] = useState<string | null>(null);

  const isPublic = type === 'PUBLIC_DATA';

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const referenceId = data.id;

    const form = {
      minPrice,
      maxPrice,
      minimumInitialInvestment,
      premium,
    };

    try {
      const data = await postPrice({
        referenceId,
        dataType: type,
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
      console.error(error);
      const message = JSON.parse((error as Error).message).error;

      alert(message);
    }
  };

  const isValid = !!minPrice && !!maxPrice;

  return (
    <div>
      <form
        id="price-form"
        className="border-2 relative border-black rounded-4xl flex flex-row p-3 mx-2 gap-4 md:mx-0"
        onSubmit={handleSave}
      >
        <div
          className="absolute -top-5 left-5 w-7 h-7 bg-black rounded-full flex items-center justify-center cursor-pointer"
          onClick={handleEdit}
        >
          {isEdit ? (
            <X className="text-white" size={15} />
          ) : (
            <Pencil className="text-white" size={15} />
          )}
        </div>
        <div className="text-[40px] font-normal text-center min-w-[100px]">
          <div className="flex flex-row items-center justify-center">
            {isEdit ? (
              <Input
                className="text-right w-[60px] border-red-700 focus-visible:border-red-700 focus-visible:ring-red-200 shadow-none"
                maxLength={4}
                placeholder={data.renovationPrice?.minPrice ?? min ?? '0'}
                required
                onChange={(e) => {
                  setMinPrice(e.target.value);
                }}
              />
            ) : (
              <span className="font-playfair">
                {data.renovationPrice?.minPrice ?? min ?? '0'}
              </span>
            )}
            억
          </div>
          <p>~</p>
          <div className="flex flex-row items-center justify-center">
            {isEdit ? (
              <Input
                className="text-right w-[60px] border-red-700 focus-visible:border-red-700 focus-visible:ring-red-200 shadow-none "
                placeholder={data.renovationPrice?.maxPrice ?? max ?? '0'}
                required
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                }}
              />
            ) : (
              <span className="font-playfair">
                {data.renovationPrice?.maxPrice ?? max ?? '0'}
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
              사용자가 게시한 대략적인 <strong>시세정보</strong>이며 매물 별로
              크게 상이할 수 있고,{' '}
              <strong className="text-gray-700">
                참고 목적으로만 제공됩니다.
              </strong>{' '}
              당신의재재는 시세내용의 정확성을 보증하지 않습니다.
            </p>
          )}

          {isPublic ? (
            <>
              <div className="flex flex-row text-[14px] font-semibold justify-between items-center border-b border-b-gray py-2">
                <p>최소 초기 투자금</p>
                <div className="flex flex-row items-end">
                  {isEdit ? (
                    <Input
                      className="text-right w-[60px]"
                      maxLength={4}
                      placeholder={
                        data.renovationPrice?.minimumInitialInvestment ?? '0'
                      }
                      onChange={(e) => {
                        setMinimumInitialInvestment(e.target.value);
                      }}
                    />
                  ) : (
                    <span className="font-playfair">
                      {data.renovationPrice?.minimumInitialInvestment ?? '0'}
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
                      className="text-right w-[60px]"
                      maxLength={4}
                      placeholder={data.renovationPrice?.premium ?? '0'}
                      onChange={(e) => {
                        setPremium(e.target.value);
                      }}
                    />
                  ) : (
                    <span className="font-playfair">
                      {data.renovationPrice?.premium ?? '0'}
                    </span>
                  )}
                  억
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-row text-base font-semibold justify-between items-center py-2">
              <p>동의율</p>
              <div className="flex flex-row items-end">
                {/* {isEdit ? (
                      <Input className="text-right" placeholder="" required />
                    ) : (
                    )} */}
                <span>{data.consentRate} %</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {isEdit && (
        <Button
          className="rounded-4xl font-medium items-center flex flex-row cursor-pointer mx-auto mt-4"
          type="submit"
          form="price-form"
          disabled={!isValid}
        >
          <Check />
          완료
        </Button>
      )}
    </div>
  );
};

export default PriceEditForm;
