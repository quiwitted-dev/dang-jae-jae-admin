import z from 'zod';
const emptyToUndefined = z
  .union([z.number(), z.nan()]) // 숫자나 NaN 허용
  .transform((v) => (Number.isNaN(v) ? undefined : v))
  .optional();
const requiredString = (msg: string) =>
  z.string().trim().min(1, { message: msg });
export const expectedSchema = z.object({
  tempName: requiredString('가칭를 입력해주세요'),
  sido: requiredString('위치를 입력해주세요'),
  gugun: requiredString('위치를 입력해주세요'),
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
  applicablePolicy: requiredString('적용 정책을 입력해주세요'),
  businessEntity: requiredString('사업주체를 입력해주세요'),
  businessType: requiredString('사업유형을 입력해주세요'),
  consentRateStr: z.string(),
  notes: z.string(),
  name: requiredString('이름을 입력해주세요'),
  phone: requiredString('연락처를 입력해주세요'),
});

export type ExpectedFormInputs = z.infer<typeof expectedSchema>;
