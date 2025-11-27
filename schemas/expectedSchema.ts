import z from 'zod';
const emptyToUndefined = z
  .union([z.number(), z.nan()]) // 숫자나 NaN 허용
  .transform((v) => (Number.isNaN(v) ? undefined : v))
  .optional();

export const expectedSchema = z.object({
  tempName: z.string().min(1, { message: '가칭을 입력해주세요' }),
  sido: z.string().min(1, { message: '가칭을 입력해주세요' }),
  gugun: z.string().min(1, { message: '가칭을 입력해주세요' }),
  dong: z.string().min(1, { message: '가칭을 입력해주세요' }),
  locationDetail: z.string(),
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
  applicablePolicy: z.string().min(1, { message: '적용정책을 입력해주세요' }),
  businessEntity: z.string().min(1, { message: '사업주체를 입력해주세요' }),
  businessType: z.string().min(1, { message: '사업유형을 입력해주세요' }),
  consentRateStr: z.string(),
  notes: z.string(),
  name: z.string().min(1, { message: '이름을 입력해주세요' }),
  phone: z.string().min(1, { message: '연락처를 입력해주세요' }),
});

export type ExpectedFormInputs = z.infer<typeof expectedSchema>;
