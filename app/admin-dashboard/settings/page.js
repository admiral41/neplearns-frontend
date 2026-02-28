"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Save,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Bell,
  Palette,
  ChevronRight,
  Upload,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminSettings,
  useUpdateGeneralSettings,
  useUpdateContactSettings,
  useUpdateSocialLinks,
  useToggleFeature,
  useUploadLogo,
} from "@/lib/hooks/useAdmin";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // For hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch settings
  const { data: settings, isLoading, error } = useAdminSettings();

  // Mutations
  const { mutate: updateGeneral, isPending: isUpdatingGeneral } = useUpdateGeneralSettings();
  const { mutate: updateContact, isPending: isUpdatingContact } = useUpdateContactSettings();
  const { mutate: updateSocial, isPending: isUpdatingSocial } = useUpdateSocialLinks();
  const { mutate: toggleFeature, isPending: isTogglingFeature } = useToggleFeature();
  const { mutate: uploadLogo, isPending: isUploadingLogo } = useUploadLogo();

  // Logo file input ref
  const logoInputRef = useRef(null);

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "",
    tagline: "",
    description: "",
  });

  const [contactSettings, setContactSettings] = useState({
    contactEmail: "",
    supportEmail: "",
    phones: [""],
    address: "",
    operatingHours: "",
    whatsapp: "",
    whatsappMessage: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  });

  // Populate forms when settings load
  useEffect(() => {
    if (settings) {
      setGeneralSettings({
        platformName: settings.platformName || "",
        tagline: settings.tagline || "",
        description: settings.description || "",
      });

      setContactSettings({
        contactEmail: settings.contactEmail || "",
        supportEmail: settings.supportEmail || "",
        phones: settings.phones?.length > 0 ? settings.phones : [""],
        address: settings.address || "",
        operatingHours: settings.operatingHours || "",
        whatsapp: settings.whatsapp || "",
        whatsappMessage: settings.whatsappMessage || "",
      });

      setSocialLinks({
        facebook: settings.socialLinks?.facebook || "",
        instagram: settings.socialLinks?.instagram || "",
        twitter: settings.socialLinks?.twitter || "",
        linkedin: settings.socialLinks?.linkedin || "",
        youtube: settings.socialLinks?.youtube || "",
      });
    }
  }, [settings]);

  const handleSaveGeneral = () => {
    updateGeneral(generalSettings);
  };

  const handleSaveContact = () => {
    // Filter out empty phone numbers before saving
    const filteredPhones = contactSettings.phones.filter(phone => phone.trim() !== "");
    updateContact({
      ...contactSettings,
      phones: filteredPhones,
    });
  };

  const handleAddPhone = () => {
    setContactSettings({
      ...contactSettings,
      phones: [...contactSettings.phones, ""],
    });
  };

  const handleRemovePhone = (index) => {
    const newPhones = contactSettings.phones.filter((_, i) => i !== index);
    setContactSettings({
      ...contactSettings,
      phones: newPhones.length > 0 ? newPhones : [""],
    });
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...contactSettings.phones];
    newPhones[index] = value;
    setContactSettings({
      ...contactSettings,
      phones: newPhones,
    });
  };

  const handleSaveSocial = () => {
    updateSocial(socialLinks);
  };

  const handleToggleFeature = (feature) => {
    toggleFeature(feature);
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, or SVG)');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Logo file must be under 1MB');
      return;
    }

    uploadLogo(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const settingsLinks = [
    {
      title: "Email Templates",
      description: "Customize email notifications sent to users",
      href: "/admin-dashboard/settings/email-templates",
      icon: Mail,
    },
    {
      title: "Payment Configuration",
      description: "Manage payment gateways and commission rates",
      href: "/admin-dashboard/settings/payment-config",
      icon: CreditCard,
    },
  ];

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to load settings</h2>
              <p className="text-muted-foreground">
                {error.message || "An error occurred while loading settings."}
              </p>
            </div>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {settingsLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={generalSettings.platformName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          platformName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={generalSettings.tagline}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          tagline: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={generalSettings.description}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {settings?.logo ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${settings.logo}`}
                            alt="Platform Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Shield className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogoClick}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, WEBP, SVG (max 1MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveGeneral}
                    className="w-full"
                    disabled={isUpdatingGeneral}
                  >
                    {isUpdatingGeneral ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Contact details displayed on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactSettings.contactEmail}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={contactSettings.supportEmail}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          supportEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Phone Numbers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPhone}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {contactSettings.phones.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={phone}
                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                            placeholder="+977 986-9906931"
                          />
                          {contactSettings.phones.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemovePhone(index)}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={contactSettings.address}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={contactSettings.operatingHours}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          operatingHours: e.target.value,
                        })
                      }
                      placeholder="Sun - Fri: 6:00 AM - 9:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      value={contactSettings.whatsapp}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          whatsapp: e.target.value,
                        })
                      }
                      placeholder="9779869906931"
                    />
                    <p className="text-xs text-muted-foreground">
                      Country code without + (e.g., 9779869906931)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappMessage">WhatsApp Pre-filled Message</Label>
                    <Textarea
                      id="whatsappMessage"
                      rows={2}
                      value={contactSettings.whatsappMessage}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          whatsappMessage: e.target.value,
                        })
                      }
                      placeholder="Hi! I want to know about your courses..."
                    />
                  </div>
                  <Button
                    onClick={handleSaveContact}
                    className="w-full"
                    disabled={isUpdatingContact}
                  >
                    {isUpdatingContact ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Links to your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <div key={platform} className="space-y-2">
                      <Label htmlFor={platform} className="capitalize">
                        {platform}
                      </Label>
                      <Input
                        id={platform}
                        value={url}
                        onChange={(e) =>
                          setSocialLinks({ ...socialLinks, [platform]: e.target.value })
                        }
                        placeholder={`https://${platform}.com/...`}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={handleSaveSocial}
                    className="w-full"
                    disabled={isUpdatingSocial}
                  >
                    {isUpdatingSocial ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {settings?.features?.maintenanceMode && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        Maintenance Mode
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Show maintenance page to all visitors
                      </p>
                    </div>
                    <Switch
                      checked={settings?.features?.maintenanceMode || false}
                      onCheckedChange={() => handleToggleFeature("maintenanceMode")}
                      disabled={isTogglingFeature}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New User Registrations</p>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch
                      checked={settings?.features?.newRegistrations || false}
                      onCheckedChange={() => handleToggleFeature("newRegistrations")}
                      disabled={isTogglingFeature}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Instructor Applications</p>
                      <p className="text-sm text-muted-foreground">
                        Accept new instructor applications
                      </p>
                    </div>
                    <Switch
                      checked={settings?.features?.instructorApplications || false}
                      onCheckedChange={() => handleToggleFeature("instructorApplications")}
                      disabled={isTogglingFeature}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Course Reviews</p>
                      <p className="text-sm text-muted-foreground">
                        Allow students to review courses
                      </p>
                    </div>
                    <Switch
                      checked={settings?.features?.courseReviews || false}
                      onCheckedChange={() => handleToggleFeature("courseReviews")}
                      disabled={isTogglingFeature}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Refund Requests</p>
                      <p className="text-sm text-muted-foreground">
                        Allow students to request refunds
                      </p>
                    </div>
                    <Switch
                      checked={settings?.features?.refundRequests || false}
                      onCheckedChange={() => handleToggleFeature("refundRequests")}
                      disabled={isTogglingFeature}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                {mounted ? (
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select disabled>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Loading..." />
                    </SelectTrigger>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  Theme changes apply immediately
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
