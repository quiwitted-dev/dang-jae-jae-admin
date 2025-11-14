import TermsContent from '@/components/my/TermsContent';
import { POLICIES_TERMS, PRIVATE_TERMS } from '@/constants/terms';

export const getSettingsContent = (settingsTab: string) => {
  console.log(settingsTab)
  switch (settingsTab) {
    case 'privacy':
      return <TermsContent terms={PRIVATE_TERMS} />;
    case 'policies':
      return <TermsContent terms={POLICIES_TERMS} />;
    case 'analysis':
      // TODO: ANALYSIS_TERMS 추가 후 사용
      return;
    case 'service':
      // TODO: SERVICE_TERMS 추가 후 사용
      return;
    default:
      return null;
  }
};
