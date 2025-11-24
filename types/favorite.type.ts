import { ApprovedSubmission } from './submission.type';

export type PublicRenovationData = {
  address: string;
  currentStage: string;
  dataSource: string;
  id: string;
  projectName: string;
  projectType: string;
};

export type Favorites = {
  success: boolean;
  favorites: Array<ApprovedSubmission>;
};
