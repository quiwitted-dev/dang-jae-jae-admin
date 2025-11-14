'use client';

import { getSettingsContent } from '@/lib/getSettingsContent';
import useStore from '@/store/useStore';

const TermsModal = () => {
  const settingsTab = useStore((state) => state.settingsTab);
  return <div>{getSettingsContent(settingsTab)}</div>;
};

export default TermsModal;
