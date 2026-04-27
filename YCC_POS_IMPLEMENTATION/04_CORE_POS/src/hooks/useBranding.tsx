import { useEffect, useState } from 'react';

export interface BrandingConfig {
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  posIconUrl: string;
  posIconColor: string;
  useCustomPosIcon: boolean;
  companyName: string;
  companyTagline: string;
  showLogoInHeader: boolean;
  showLogoInReceipt: boolean;
  showLogoInLogin: boolean;
  iconStyle: 'outline' | 'filled' | 'two-tone';
}

const defaultBranding: BrandingConfig = {
  logoUrl: '',
  logoWidth: 120,
  logoHeight: 40,
  posIconUrl: '',
  posIconColor: '#10B981',
  useCustomPosIcon: false,
  companyName: 'YCC Country Club',
  companyTagline: '',
  showLogoInHeader: true,
  showLogoInReceipt: true,
  showLogoInLogin: true,
  iconStyle: 'outline',
};

const STORAGE_KEY = 'ycc_theme_config';

export function useBranding() {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  useEffect(() => {
    // Load branding from localStorage (synced with Admin Panel)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const config = JSON.parse(stored);
        if (config.branding) {
          setBranding({ ...defaultBranding, ...config.branding });
        }
      } catch {
        console.warn('Failed to parse theme config');
      }
    }

    // Listen for changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newConfig = e.newValue ? JSON.parse(e.newValue) : null;
        if (newConfig?.branding) {
          setBranding({ ...defaultBranding, ...newConfig.branding });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return branding;
}

// Component for displaying the logo
export function Logo({ 
  width, 
  height, 
  className = '' 
}: { 
  width?: number; 
  height?: number; 
  className?: string;
}) {
  const branding = useBranding();
  const w = width || branding.logoWidth;
  const h = height || branding.logoHeight;

  if (branding.logoUrl) {
    return (
      <img
        src={branding.logoUrl}
        alt={branding.companyName}
        style={{ width: w, height: h }}
        className={`object-contain ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div 
      className={`flex items-center justify-center bg-gray-200 rounded ${className}`}
      style={{ width: w, height: h }}
    >
      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}
