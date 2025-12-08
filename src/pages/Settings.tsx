import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Palette, Layout, RotateCcw, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserSettings {
  theme: 'light' | 'dark' | 'blue-dark';
  sidebarOrder: string[];
  compactMode: boolean;
  animations: boolean;
  autoSave: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  sidebarOrder: [
    'overview', 'upload-resume', 'career-quiz', 'assessment',
    'recommendations', 'skill-analysis', 'roadmap', 'resume-analyzer',
    'interview-coach', 'job-portal', 'reports', 'resources'
  ],
  compactMode: false,
  animations: true,
  autoSave: true
};

const Settings = () => {
  const { currentUser } = useAuth();
  const { userTheme, setUserTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Load user settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser?.uid) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.settings) {
            const userSettings = { ...defaultSettings, ...userData.settings };
            setSettings(userSettings);
            // Sync theme with global context
            setUserTheme(userSettings.theme);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load your settings.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, setUserTheme, toast]);

  // Sync theme when settings change
  useEffect(() => {
    if (settings.theme !== userTheme) {
      setUserTheme(settings.theme);
    }
  }, [settings.theme, userTheme, setUserTheme]);

  // Save settings to Firestore
  const saveSettings = async () => {
    if (!currentUser?.uid) return;

    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        settings: settings
      }, { merge: true });

      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save your settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const resetToDefault = async () => {
    if (!currentUser?.uid) return;

    try {
      // Reset local settings
      setSettings(defaultSettings);

      // Apply default theme
      setUserTheme(defaultSettings.theme);

      // Save default settings to Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        settings: defaultSettings
      }, { merge: true });

      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default and saved.",
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings.",
        variant: "destructive"
      });
    }
  };

  // Update theme
  const updateTheme = async (newTheme: UserSettings['theme']) => {
    if (!currentUser?.uid) return;

    const newSettings = { ...settings, theme: newTheme };

    // Update local state immediately
    setSettings(newSettings);
    setUserTheme(newTheme); // Update user theme

    // Save theme change immediately to Firestore
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        settings: { theme: newTheme }
      }, { merge: true });
    } catch (error) {
      console.error('Error saving theme immediately:', error);
    }
  };

  // Update setting
  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, item?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (item) setDragOverItem(item);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetItem: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetItem) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = settings.sidebarOrder.indexOf(draggedItem);
    const targetIndex = settings.sidebarOrder.indexOf(targetItem);

    const newOrder = [...settings.sidebarOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setSettings(prev => ({ ...prev, sidebarOrder: newOrder }));
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Loading your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Customize your dashboard experience</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-auto sm:ml-0">
          <Button variant="outline" onClick={resetToDefault} size="sm" className="flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reset to Default</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button onClick={saveSettings} disabled={saving} size="sm" className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Theme Settings */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Palette className="h-5 w-5 flex-shrink-0" />
              <span>Theme & Appearance</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Choose your preferred color scheme and visual style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => updateTheme('light')}
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-0"
                >
                  Light
                </Button>
                <Button
                  onClick={() => updateTheme('dark')}
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-0"
                >
                  Dark
                </Button>
                <Button
                  onClick={() => updateTheme('blue-dark')}
                  variant={settings.theme === 'blue-dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 min-w-0"
                >
                  Blue Dark
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <Label className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Reduce spacing and padding for more content
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  className="flex-shrink-0 mt-1"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <Label className="text-sm font-medium">Animations</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => updateSetting('animations', checked)}
                  className="flex-shrink-0 mt-1"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <Label className="text-sm font-medium">Auto-save</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Automatically save changes as you make them
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  className="flex-shrink-0 mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Customization */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Layout className="h-5 w-5 flex-shrink-0" />
              <span>Sidebar Layout</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Customize the order and appearance of sidebar items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>Sidebar Item Order</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop to reorder sidebar items. This affects both desktop and mobile navigation.
              </p>

              <div className="space-y-2">
                {settings.sidebarOrder.map((item, index) => (
                  <div
                    key={item}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg cursor-move transition-all duration-200 touch-manipulation ${
                      draggedItem === item
                        ? 'bg-primary/10 border-primary shadow-lg scale-105 opacity-80'
                        : dragOverItem === item
                        ? 'bg-accent/20 border-accent shadow-md scale-102'
                        : 'bg-muted/50 hover:bg-muted hover:shadow-md active:bg-muted'
                    }`}
                    style={{ minHeight: '48px' }} // Ensure minimum touch target
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Badge variant="outline" className="flex-shrink-0">{index + 1}</Badge>
                      <span className="capitalize font-medium text-sm sm:text-base truncate">
                        {item.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground select-none flex-shrink-0 ml-2">
                      ⋮⋮
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Tip:</strong> Drag any item to reorder your sidebar navigation.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click "Load Sidebar" to apply changes immediately.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      // Save current settings to trigger sidebar update
                      await saveSettings();
                      toast({
                        title: "Sidebar Updated",
                        description: "Your sidebar has been updated with the new order.",
                      });
                    }}
                    disabled={saving}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {saving ? 'Loading...' : 'Load Sidebar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Settings Summary */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Current Settings Summary</CardTitle>
          <CardDescription className="text-sm">
            Overview of your current preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3">
              <div className="font-medium text-sm sm:text-base">Theme</div>
              <Badge variant="secondary" className="mt-1 capitalize text-xs">
                {settings.theme.replace('-', ' ')}
              </Badge>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="font-medium text-sm sm:text-base">Compact Mode</div>
              <Badge variant={settings.compactMode ? "default" : "secondary"} className="mt-1 text-xs">
                {settings.compactMode ? "On" : "Off"}
              </Badge>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="font-medium text-sm sm:text-base">Animations</div>
              <Badge variant={settings.animations ? "default" : "secondary"} className="mt-1 text-xs">
                {settings.animations ? "On" : "Off"}
              </Badge>
            </div>
            <div className="text-center p-2 sm:p-3">
              <div className="font-medium text-sm sm:text-base">Auto-save</div>
              <Badge variant={settings.autoSave ? "default" : "secondary"} className="mt-1 text-xs">
                {settings.autoSave ? "On" : "Off"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Settings;