

'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '../services/admin.service';

// Default settings (fallback values)
const defaultSettings = {
  platformName: 'Neplearns',
  tagline: 'Learn. Grow. Succeed.',
  description: '',
  logo: null, // no logo yet
  contactEmail: 'neplearns@gmail.com',
  supportEmail: '',
  phones: ['+977 986-9906931'],
  address: 'Kathmandu, Nepal',
  operatingHours: 'Sun - Fri: 6:00 AM - 9:00 PM',
  whatsapp: '9779869906931',
  whatsappMessage: 'Hi! I want to know about Neplearns courses for SEE/+2 preparation. Please share course details and fees.',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },
  features: {
    maintenanceMode: false,
    newRegistrations: true,
    instructorApplications: true,
    courseReviews: true,
    refundRequests: true,
  },
};

const SettingsContext = createContext({
  settings: defaultSettings,
  isLoading: true,
  error: null,
  getLogoUrl: () => '/images/default-logo.png', // fallback placeholder
  getPlatformName: () => 'Neplearns',
  getTagline: () => 'Learn. Grow. Succeed.',
  getContactEmail: () => defaultSettings.contactEmail,
  getPhones: () => defaultSettings.phones,
  getAddress: () => defaultSettings.address,
  getOperatingHours: () => defaultSettings.operatingHours,
  getWhatsappNumber: () => defaultSettings.whatsapp,
  getWhatsappMessage: () => defaultSettings.whatsappMessage,
  getWhatsappUrl: () => `https://wa.me/${defaultSettings.whatsapp}?text=${encodeURIComponent(defaultSettings.whatsappMessage)}`,
});

export function SettingsProvider({ children }) {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: async () => {
      const response = await adminService.getSettings();
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const getLogoUrl = () => {
    if (settings?.logo) {
      return `${process.env.NEXT_PUBLIC_API_URL}${settings.logo}`;
    }
    return '/images/default-logo.png'; // fallback placeholder
  };

  const getPlatformName = () => settings?.platformName || defaultSettings.platformName;
  const getTagline = () => settings?.tagline || defaultSettings.tagline;
  const getContactEmail = () => settings?.contactEmail || defaultSettings.contactEmail;
  const getPhones = () => (settings?.phones?.length > 0 ? settings.phones : defaultSettings.phones);
  const getAddress = () => settings?.address || defaultSettings.address;
  const getOperatingHours = () => settings?.operatingHours || defaultSettings.operatingHours;
  const getWhatsappNumber = () => settings?.whatsapp || defaultSettings.whatsapp;
  const getWhatsappMessage = () => settings?.whatsappMessage || defaultSettings.whatsappMessage;
  const getWhatsappUrl = () => {
    const number = getWhatsappNumber();
    const message = getWhatsappMessage();
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const value = {
    settings: settings || defaultSettings,
    isLoading,
    error,
    getLogoUrl,
    getPlatformName,
    getTagline,
    getContactEmail,
    getPhones,
    getAddress,
    getOperatingHours,
    getWhatsappNumber,
    getWhatsappMessage,
    getWhatsappUrl,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// Custom hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsProvider;