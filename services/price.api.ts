import { PriceType } from '@/types/price.type';

type PostPriceType = {
  referenceId: string;
  dataType: 'PUBLIC_DATA' | 'SUBMISSION';
  form: {
    minPrice: string;
    maxPrice: string;
    minimumInitialInvestment?: string;
    premium?: string;
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

    if (!res.ok) {
      throw new Error(`가격 입력 실패 ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
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

    if (!res.ok) {
      throw new Error(`가격 입력 실패 ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  }

  throw new Error(`지원하지 않는 dataType: ${dataType}`);
};
