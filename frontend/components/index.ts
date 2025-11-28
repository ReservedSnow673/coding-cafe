import dynamic from 'next/dynamic';

export const CampusMap = dynamic(() => import('./CampusMap'), { ssr: false });
export { default as DevModeToggle } from './DevModeToggle';
export { default as NotificationBell } from './NotificationBell';
export { default as PWAInstaller } from './PWAInstaller';
export { Providers } from './Providers';
export { default as ThemeToggle } from './ThemeToggle';
