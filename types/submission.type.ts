export type ApprovedSubmissionList = {
  success: boolean;
  submissions: Array<ApprovedSubmission>;
  total?: 0;
};

export type ApprovedSubmission = {
  id: string;
  dataType: 'PUBLIC_DATA' | 'SUBMISSION';
  projectName: string;
  address: string;
  projectType: string;
  currentStage: string;
  generalSaleUnits: number;
  averageLandSharePyeong: string;
  totalSaleUnits: number;
  newConstructionUnits: number;
  rentalUnits: number;
  projectAreaM2: string;
  volumeRatio: string;
  newVolumeRatio: string;
  ownerCount: number;
  businessOperatorName: string;
  announcementDates: {};
  renovationPrice: Renovationprice;
  dataSource: string;
  createdAt: string;
  reviewedAt: string;
  referenceId?: string;
  user: {
    id: string;
    nickname: string;
  };
};

export type SubmissionPublicDetail =
  | SeoulSubmissionDetail
  | GyeonggiSubmissionDetail;

export type SeoulSubmissionDetail = {
  id: string; // 고유 ID
  dataSource: 'SEOUL'; // 데이터 출처 (서울)

  district: string; // 자치구명
  representativeLotNumber: string; // 대표지번
  businessType: string; // 사업구분
  currentStage: string; // 진행단계
  renovationZoneName: string; // 정비구역명칭
  usageZone: string; // 용도지역
  mainUsage: string; // 주용도

  ownerCount: number; // 토지 등 소유자 수

  projectAreaM2: string; // 정비구역면적(㎡)
  residentialLandAreaM2: string; // 택지면적(㎡)
  parkAreaM2: string; // 공원면적(㎡)
  publicOpenSpaceAreaM2: string; // 공공공지면적(㎡)
  otherAreaM2: string; // 기타면적(㎡)

  constructionPlanNotes: string; // 건축 계획 비고
  buildingCoverageRatio: string; // 건폐율(%)
  volumeRatio: string; // 용적률(%)

  newConstructionFloors: number; // 지상층수

  totalSaleUnits: number; // 분양세대총수
  unitsUnder60M2: number; // 60㎡ 이하 분양 세대수
  units60To85M2: number; // 60~85㎡ 분양 세대수
  unitsOver85M2: number; // 85㎡ 초과 분양 세대수

  rentalUnits: number; // 임대세대총수
};

export type GyeonggiSubmissionDetail = {
  id: string; // 고유 ID
  dataSource: 'GYEONGGI'; // 데이터 출처 (경기)

  sigunNm: string; // 시군명
  currentStage: string; // 사업단계
  projectType: string; // 사업유형
  imprvZoneNm: string; // 정비구역명
  address: string; // 위치(주소)

  projectAreaM2: string; // 구역면적(㎡)

  totalSaleUnits: number; // 사업시행세대수총계
  generalSaleUnits: number; // 일반분양세대수
  rentalUnits: number; // 임대세대수
  newVolumeRatio: string; // 용적률(%)

  ownerCount: number; // 토지등소유자수

  projectedStartDate: string; // 사업예정기간(시작)
  projectedEndDate: string; // 사업예정기간(완료)

  designatedZoneNotificationDate: string; // 정비예정구역고시일자
  designatedZoneExpectedDate: string; // 정비구역지정예정일자
  planApprovalDate: string; // 정비계획승인일자

  zoneDesignationDateInitial: string; // 정비구역지정일자(최초)
  zoneDesignationDateChanged: string | null; // 정비구역지정일자(변경)

  promotionCommitteeApprovalDate: string; // 추진위승인일자
  associationEstablishmentApprovalDate: string; // 조합설립인가일자
  projectImplementationApprovalDate: string; // 사업시행인가일자
  managementDispositionApprovalDate: string | null; // 관리처분인가일자

  newUnitsUnder40M2: number; // 40㎡ 미만
  newUnits40To60M2: number; // 40~60㎡
  newUnits60To85M2: number; // 60~85㎡
  newUnits85To135M2: number; // 85~135㎡
  newUnitsOver135M2: number; // 135㎡ 이상
};

export type SubmissionUserDetail = {
  id: string;
  tempName: string;
  location: string;
  applicablePolicy: string;
  businessEntity: string;
  businessType: string;
  mainUsage: string;
  usageZone: string;

  projectArea: string;
  currentVolumeRatio: string;
  expectedVolumeRatio: string;

  expectedNewUnits: number;
  ownerCount: number;
  constructionYear: number;

  priceRange: string;
  consentRate: string;
  consentContact: string;

  notes: string;

  createdAt: string;
  updatedAt: string;
};

export type Renovationprice = {
  id: string;
  price: string;
  minimumInitialInvestment: string;
  premium: string;
  status: string;
  isDisplayed: true;
  displayedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickname: string;
  };
};
