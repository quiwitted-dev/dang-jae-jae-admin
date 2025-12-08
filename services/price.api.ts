import { PriceType } from '@/types/price.type';

type PostPriceType = {
  referenceId: string;
  dataType: 'PUBLIC_DATA' | 'SUBMISSION';
  form: {
    minPrice: string;
    maxPrice: string;
    minimumInitialInvestment?: string | null;
    premium?: string | null;
  };
};

export const postPrice = async ({
  referenceId,
  dataType,
  form,
}: PostPriceType): Promise<PriceType> => {
  if (dataType === 'PUBLIC_DATA') {
    const res = await fetch(`/api/price`, {
      method: 'POST',
      body: JSON.stringify({
        referenceId,
        dataType,
        minPrice: form.minPrice,
        maxPrice: form.maxPrice,
        minimumInitialInvestment: form.minimumInitialInvestment,
        premium: form.premium,
      }),
    });

    const data = await res.json();

    if (data.success === false) {
      throw new Error(data.message || '가격 입력에 실패했습니다.');
    }
    return data.data;
  }
  if (dataType === 'SUBMISSION') {
    const res = await fetch(`/api/price`, {
      method: 'POST',
      body: JSON.stringify({
        referenceId,
        dataType,
        minPrice: form.minPrice,
        maxPrice: form.maxPrice,
      }),
    });

    const data = await res.json();

    if (data.success === false) {
      throw new Error(data.message || '가격 입력에 실패했습니다.');
    }
    return data.data;
  }

  throw new Error(`지원하지 않는 dataType: ${dataType}`);
};
