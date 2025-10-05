"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SiteSettings as SiteSettingsEntity } from '@/lib/entities';
import { 
    Save, 
    Settings, 
    Globe, 
    Bell, 
    Mail, 
    Phone, 
    MapPin,
    Building,
    Palette,
    Languages
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SiteSettingsData {
    id?: string;
    company_name: string;
    tagline: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    whatsapp_number: string;
    default_theme: 'light' | 'dark';
    default_language: 'en' | 'ne';
    enable_dealer_notifications: boolean;
    enable_inquiry_notifications: boolean;
    enable_whatsapp_notifications: boolean;
    auto_approve_dealers: boolean;
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<SiteSettingsData>({
        company_name: 'Jeen Mata Impex',
        tagline: 'Premium Import Solutions from China & India',
        contact_email: 'info@jeenmataimpex.com',
        contact_phone: '+977-1-4567890',
        contact_address: 'Kathmandu, Nepal',
        whatsapp_number: '+977-9876543210',
        default_theme: 'light',
        default_language: 'en',
        enable_dealer_notifications: true,
        enable_inquiry_notifications: true,
        enable_whatsapp_notifications: false,
        auto_approve_dealers: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (id: string, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    // Load existing settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const settingsList = await SiteSettingsEntity.list();
                if (settingsList && settingsList.length > 0) {
                    const existingSettings = settingsList[0];
                    console.log('Loaded existing settings:', existingSettings);
                    setSettings({
                        id: existingSettings.id,
                        company_name: existingSettings.company_name || 'Jeen Mata Impex',
                        tagline: existingSettings.tagline || 'Premium Import Solutions from China & India',
                        contact_email: existingSettings.contact_email || 'info@jeenmataimpex.com',
                        contact_phone: existingSettings.contact_phone || '+977-1-4567890',
                        contact_address: existingSettings.contact_address || 'Kathmandu, Nepal',
                        whatsapp_number: existingSettings.whatsapp_number || '+977-9876543210',
                        default_theme: existingSettings.default_theme || 'light',
                        default_language: existingSettings.default_language || 'en',
                        enable_dealer_notifications: existingSettings.enable_dealer_notifications ?? true,
                        enable_inquiry_notifications: existingSettings.enable_inquiry_notifications ?? true,
                        enable_whatsapp_notifications: existingSettings.enable_whatsapp_notifications ?? false,
                        auto_approve_dealers: existingSettings.auto_approve_dealers ?? false,
                    });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
                setSaveStatus('error');
            }
            setIsLoading(false);
        };
        
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        
        try {
            console.log('Saving settings to database:', settings);
            
            if (settings.id) {
                // Update existing settings
                await SiteSettingsEntity.update(settings.id, settings);
                console.log('Settings updated successfully');
            } else {
                // This shouldn't happen as we should always have a settings record
                console.warn('No settings ID found, this might indicate a database issue');
            }
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
        
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-lg text-gray-600">Loading settings...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Settings className="h-8 w-8 text-gray-700" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                </div>

                {saveStatus && (
                    <Alert className={`mb-6 ${saveStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <AlertDescription className={saveStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {saveStatus === 'success' ? '✅ Settings saved successfully!' : '❌ Failed to save settings. Please try again.'}
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="company" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="company" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Company
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="system" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            System
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="company">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input 
                                            id="company_name" 
                                            value={settings.company_name} 
                                            onChange={handleInputChange}
                                            placeholder="Your company name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline</Label>
                                        <Input 
                                            id="tagline" 
                                            value={settings.tagline} 
                                            onChange={handleInputChange}
                                            placeholder="Company tagline"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Contact Email
                                        </Label>
                                        <Input 
                                            id="contact_email" 
                                            type="email"
                                            value={settings.contact_email} 
                                            onChange={handleInputChange}
                                            placeholder="contact@company.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Phone
                                        </Label>
                                        <Input 
                                            id="contact_phone" 
                                            value={settings.contact_phone} 
                                            onChange={handleInputChange}
                                            placeholder="+977-1-4567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            WhatsApp Number
                                        </Label>
                                        <Input 
                                            id="whatsapp_number" 
                                            value={settings.whatsapp_number} 
                                            onChange={handleInputChange}
                                            placeholder="+977-9876543210"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </Label>
                                        <Input 
                                            id="contact_address" 
                                            value={settings.contact_address} 
                                            onChange={handleInputChange}
                                            placeholder="Company address"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Appearance & Localization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="default-theme" className="text-base font-medium">Default Theme</Label>
                                        <p className="text-sm text-gray-600">Choose the default theme for new users</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={settings.default_theme === 'light' ? 'font-medium' : 'text-gray-500'}>Light</span>
                                        <Switch 
                                            id="default-theme" 
                                            checked={settings.default_theme === 'dark'}
                                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, default_theme: checked ? 'dark' : 'light' }))}
                                        />
                                        <span className={settings.default_theme === 'dark' ? 'font-medium' : 'text-gray-500'}>Dark</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="default-language" className="text-base font-medium flex items-center gap-2">
                                            <Languages className="h-4 w-4" />
                                            Default Language
                                        </Label>
                                        <p className="text-sm text-gray-600">Choose the default language for the site</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={settings.default_language === 'en' ? 'font-medium' : 'text-gray-500'}>English</span>
                                        <Switch 
                                            id="default-language" 
                                            checked={settings.default_language === 'ne'}
                                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, default_language: checked ? 'ne' : 'en' }))}
                                        />
                                        <span className={settings.default_language === 'ne' ? 'font-medium' : 'text-gray-500'}>नेपाली</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="dealer-notifications" className="text-base font-medium">Dealer Approval Notifications</Label>
                                        <p className="text-sm text-gray-600">Send email notifications when dealers are approved/rejected</p>
                                    </div>
                                    <Switch 
                                        id="dealer-notifications" 
                                        checked={settings.enable_dealer_notifications}
                                        onCheckedChange={(checked) => handleSwitchChange('enable_dealer_notifications', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="inquiry-notifications" className="text-base font-medium">New Inquiry Alerts</Label>
                                        <p className="text-sm text-gray-600">Receive notifications when new inquiries are submitted</p>
                                    </div>
                                    <Switch 
                                        id="inquiry-notifications" 
                                        checked={settings.enable_inquiry_notifications}
                                        onCheckedChange={(checked) => handleSwitchChange('enable_inquiry_notifications', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="whatsapp-notifications" className="text-base font-medium">WhatsApp Notifications</Label>
                                        <p className="text-sm text-gray-600">Enable WhatsApp notifications for important updates</p>
                                    </div>
                                    <Switch 
                                        id="whatsapp-notifications" 
                                        checked={settings.enable_whatsapp_notifications}
                                        onCheckedChange={(checked) => handleSwitchChange('enable_whatsapp_notifications', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    System Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <Label htmlFor="auto-approve" className="text-base font-medium">Auto-approve Dealers</Label>
                                        <p className="text-sm text-gray-600">Automatically approve new dealer applications</p>
                                        <p className="text-xs text-amber-600 mt-1">⚠️ Not recommended for production</p>
                                    </div>
                                    <Switch 
                                        id="auto-approve" 
                                        checked={settings.auto_approve_dealers}
                                        onCheckedChange={(checked) => handleSwitchChange('auto_approve_dealers', checked)}
                                    />
                                </div>

                                <div className="p-4 border rounded-lg bg-blue-50">
                                    <h4 className="font-medium text-blue-900 mb-2">System Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-700">Version:</span>
                                            <span className="ml-2 font-mono">1.0.0</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Environment:</span>
                                            <span className="ml-2 font-mono">Development</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Database:</span>
                                            <span className="ml-2 font-mono">Connected</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Last Updated:</span>
                                            <span className="ml-2 font-mono">2024-09-24</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-6">
                    <Button onClick={handleSave} disabled={isSaving} size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
