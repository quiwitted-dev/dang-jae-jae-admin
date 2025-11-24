import z from 'zod';

export const expectedSchema = z.object({
  tempName: z.string().min(1, { message: '가칭을 입력해주세요' }),
  sido: z.string().min(1, { message: '가칭을 입력해주세요' }),
  gugun: z.string().min(1, { message: '가칭을 입력해주세요' }),
  dong: z.string().min(1, { message: '가칭을 입력해주세요' }),
  locationDetail: z.string(),
  consentContact: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
  ownerCount: z.number(),
  expectedNewUnits: z.number(),
  projectArea: z.number(),
  currentVolumeRatio: z.number(),
  expectedVolumeRatio: z.number(),
  constructionYearStart: z.number(),
  constructionYearEnd: z.number(),
  mainUsage: z.string(),
  usageZone: z.string(),
  applicablePolicy: z.string(),
  businessEntity: z.string(),
  businessType: z.string(),
  consentRateStr: z.string(),
  notes: z.string(),
});

export type ExpectedFormInputs = z.infer<typeof expectedSchema>;
