export type PriceType = {
  success: boolean;
  renovationPrice: {
    id: string;
    minPrice: string;
    maxPrice: string;
    minimumInitialInvestment: string;
    premium: string;
    status: string;
    isDisplayed: boolean;
    displayedAt: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      nickname: string;
    };
    userId: string;
    referenceId: string;
    dataType: string;
    memo: string;
    evidence: string;
    attachments: [
      {
        additionalProp1: {};
      }
    ];
    publicRenovationData: {
      id: string;
      projectName: string;
      address: string;
    };
    renovationPlaceSubmission: {
      id: string;
      projectName: string;
      address: string;
      businessType: string;
      adminId: string;
    };
  };
};
