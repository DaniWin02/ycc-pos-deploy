import React, { useEffect } from 'react';
import { useThemeStore } from '../../stores/theme.store';

// Component that applies theme to sidebar styles
export const ThemeSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTheme } = useThemeStore();

  // Apply theme colors as CSS variables to this component
  useEffect(() => {
    const style = document.documentElement.style;
    
    // Apply sidebar colors
    style.setProperty('--admin-sidebar-bg', currentTheme.colors.sidebarBackground);
    style.setProperty('--admin-sidebar-text', currentTheme.colors.sidebarText);
    style.setProperty('--admin-sidebar-active-bg', currentTheme.colors.sidebarActive);
    style.setProperty('--admin-sidebar-active-text', currentTheme.colors.sidebarActiveText);
    style.setProperty('--admin-primary', currentTheme.colors.primary);
  }, [currentTheme]);

  return <>{children}</>;
};

export default ThemeSidebar;
