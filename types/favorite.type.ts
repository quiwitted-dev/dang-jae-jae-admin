export type PublicRenovationData = {
  address: string;
  currentStage: string;
  dataSource: string;
  id: string;
  projectName: string;
  projectType: string;
};

export type Favorite = {
  createdAt: string;
  dataType: string; // "PUBLIC_DATA"
  id: string;
  publicRenovationData: PublicRenovationData;
  referenceId: string;
  updatedAt: string;
};

export type FavoriteApiResponse = {
  success: boolean;
  favorites: Favorite[];
};
