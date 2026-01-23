import z from 'zod';
import { getStringWeight } from '@/lib/utils';

const emptyToUndefined = z
  .union([z.number(), z.nan()]) // 숫자나 NaN 허용
  .transform((v) => (Number.isNaN(v) ? undefined : v))
  .optional();
const requiredString = (msg: string) =>
  z.string().trim().min(1, { message: msg });

export const expectedSchema = z.object({
  tempName: requiredString('가칭를 입력해주세요').refine(
    (val) => getStringWeight(val) <= 26,
    { message: '가칭이 너무 깁니다.' }
  ),
  sido: requiredString('위치를 입력해주세요'),
  gugun: z.string(),
  dong: requiredString('위치를 입력해주세요'),
  locationDetail: requiredString('위치를 입력해주세요'),
  consentContact: z.string(),
  minPrice: emptyToUndefined,
  maxPrice: emptyToUndefined,
  ownerCount: emptyToUndefined,
  expectedNewUnits: emptyToUndefined,
  projectArea: emptyToUndefined,
  currentVolumeRatio: emptyToUndefined,
  expectedVolumeRatio: emptyToUndefined,
  constructionYearStart: emptyToUndefined,
  constructionYearEnd: emptyToUndefined,
  mainUsage: z.string(),
  usageZone: z.string(),
  applicablePolicy: requiredString('적용 정책을 입력해주세요').refine(
    (val) => getStringWeight(val) <= 26,
    { message: '적용가능정책이 너무 깁니다.' }
  ),
  businessEntity: requiredString('사업주체를 입력해주세요'),
  businessType: requiredString('사업유형을 입력해주세요'),
  consentRateStr: z.string(),
  notes: z.string().refine(
    (val) => getStringWeight(val) <= 26,
    { message: '기타사항이 너무 깁니다.' }
  ),
  submittedName: requiredString('이름을 입력해주세요'),
  submittedPhoneNumber: requiredString('연락처를 입력해주세요'),
});

export type ExpectedFormInputs = z.infer<typeof expectedSchema>;
