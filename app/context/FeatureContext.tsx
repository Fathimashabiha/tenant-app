import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { featuresService } from '../../lib/featuresService';

export type FeatureConfig = {
  communityEnabled: boolean;
  tenancyEnabled: boolean;
};

const DEFAULT_CONFIG: FeatureConfig = {
  communityEnabled: false,
  tenancyEnabled: false,
};

const TENANT_ID = 'default-tenant-uuid';

type FeatureContextType = {
  config: FeatureConfig;
  isLoading: boolean;
  refreshFeatures: () => Promise<void>;
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FeatureConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFeatures = useCallback(async () => {
    try {
      const data = await featuresService.getFeatures(TENANT_ID);
      setConfig({
        communityEnabled: Boolean(data.communityEnabled),
        tenancyEnabled: Boolean(data.tenancyEnabled),
      });
    } catch {
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeatures();
  }, [refreshFeatures]);

  return (
    <FeatureContext.Provider value={{ config, isLoading, refreshFeatures }}>
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
