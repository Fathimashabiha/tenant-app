import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureConfig = {
  communityEnabled: boolean;
  tenancyEnabled: boolean;
};

const DEFAULT_CONFIG: FeatureConfig = {
  communityEnabled: false,
  tenancyEnabled: false,
};

type FeatureContextType = {
  config: FeatureConfig;
  updateConfig: (updates: Partial<FeatureConfig>) => void;
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FeatureConfig>(DEFAULT_CONFIG);

  const updateConfig = (updates: Partial<FeatureConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <FeatureContext.Provider value={{ config, updateConfig }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}
