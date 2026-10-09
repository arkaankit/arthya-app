import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { PrimaryButton } from "./PrimaryButton";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Globe, Sparkles, Camera, Edit2, Check, X, HardDriveDownload } from "lucide-react";
import { useData } from "../lib/data-context";

import { CURRENCIES } from "../lib/currency";
import { toast } from "sonner@2.0.3";

interface SettingsViewProps {
  onResetData: () => void;
  onOpenSaves: () => void;
}

export function SettingsView({ onResetData, onOpenSaves }: SettingsViewProps) {
  const { profile, updateProfile, replayOnboarding } = useData();
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || "USD");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    if (profile) {
      updateProfile({
        ...profile,
        currency: newCurrency
      });
      toast.success(`Default currency updated to ${newCurrency}`);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!editedProfile.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (profile) {
      updateProfile({
        ...profile,
        name: editedProfile.name.trim(),
        email: editedProfile.email.trim(),
        phone: editedProfile.phone.trim(),
        location: editedProfile.location.trim(),
        bio: editedProfile.bio.trim(),
        avatar: editedProfile.avatar
      });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      avatar: profile?.avatar || ''
    });
    setIsEditingProfile(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your preferences and privacy settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl">
        {/* Currency Settings */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2">Default Currency</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set your preferred currency for the application. All multi-currency amounts will be converted to this base currency.
              </p>
              <div className="max-w-xs">
                <Label htmlFor="currency">Base Currency</Label>
                <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center gap-2">
                          <span>{curr.flag}</span>
                          <span>{curr.code}</span>
                          <span className="text-muted-foreground">- {curr.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={isEditingProfile ? editedProfile.avatar : profile?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600 text-white text-2xl">
                    {profile?.name ? getInitials(profile.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditingProfile && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity opacity-60 can-hover:opacity-0 can-hover:group-hover:opacity-100"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4>Profile Information</h4>
                {!isEditingProfile ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingProfile(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelEdit}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <PrimaryButton 
                      onClick={handleSaveProfile}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Save
                    </PrimaryButton>
                  </div>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm space-y-2">
                  {profile?.name && (
                    <p><span className="text-muted-foreground">Name:</span> {profile.name}</p>
                  )}
                  {profile?.email && (
                    <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
                  )}
                  {profile?.phone && (
                    <p><span className="text-muted-foreground">Phone:</span> {profile.phone}</p>
                  )}
                  {profile?.location && (
                    <p><span className="text-muted-foreground">Location:</span> {profile.location}</p>
                  )}
                  {profile?.bio && (
                    <div>
                      <p className="text-muted-foreground mb-1">Bio:</p>
                      <p className="text-foreground">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replay setup */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 shadow-sm shadow-yellow-500/10">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2">Player & setup</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Change your creature, name or home currency by replaying the welcome setup. Quests you already finished stay finished.
              </p>
              <Button variant="outline" size="sm" onClick={replayOnboarding} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Replay setup
              </Button>
            </div>
          </div>
        </div>
        
        {/* Backup & Restore */}
        <div className="p-4 sm:p-6 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <HardDriveDownload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2">Save & Load</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your data lives only in this browser. Save a backup file to keep it safe or to
                move it to another device, then load it there.
              </p>
              <Button variant="outline" size="sm" onClick={onOpenSaves} className="gap-2">
                <HardDriveDownload className="w-4 h-4" />
                Open Save & Load
              </Button>
            </div>
          </div>
        </div>

        {/* Reset Data */}
        <div className="p-4 sm:p-6 border border-destructive rounded-xl bg-card shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="mb-2 text-destructive">Reset All Data</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This will delete all your accounts, income, expenses, and goals. 
                This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" onClick={onResetData}>
                Reset Everything
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}