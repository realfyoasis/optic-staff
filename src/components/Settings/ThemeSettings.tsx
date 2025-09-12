import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { Palette, Check, Moon, Sun, Monitor } from 'lucide-react';

const themes = [
  {
    name: 'Default',
    value: 'default',
    description: 'Clean and professional blue theme',
    preview: 'linear-gradient(135deg, hsl(222, 84%, 65%) 0%, hsl(262, 83%, 58%) 100%)',
  },
  {
    name: 'Forest',
    value: 'forest',
    description: 'Nature-inspired green tones',
    preview: 'linear-gradient(135deg, hsl(142, 71%, 45%) 0%, hsl(158, 64%, 52%) 100%)',
  },
  {
    name: 'Ocean',
    value: 'ocean',
    description: 'Deep blue oceanic colors',
    preview: 'linear-gradient(135deg, hsl(200, 88%, 48%) 0%, hsl(217, 91%, 60%) 100%)',
  },
  {
    name: 'Sunset',
    value: 'sunset',
    description: 'Warm orange and pink gradients',
    preview: 'linear-gradient(135deg, hsl(31, 100%, 60%) 0%, hsl(340, 82%, 62%) 100%)',
  },
  {
    name: 'Purple',
    value: 'purple',
    description: 'Rich purple and violet hues',
    preview: 'linear-gradient(135deg, hsl(271, 81%, 56%) 0%, hsl(291, 64%, 42%) 100%)',
  },
  {
    name: 'Monochrome',
    value: 'monochrome',
    description: 'Elegant black and white',
    preview: 'linear-gradient(135deg, hsl(0, 0%, 20%) 0%, hsl(0, 0%, 40%) 100%)',
  },
];

const ThemeSettings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
  };

  const toggleMode = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Theme Settings</h1>
          <p className="text-muted-foreground">Customize the appearance of your dashboard</p>
        </div>
      </div>

      {/* Dark/Light Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Display Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current mode: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark display modes
              </p>
            </div>
            <Button
              onClick={toggleMode}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Choose from our carefully crafted color palettes to personalize your dashboard
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((themeOption) => (
              <Card 
                key={themeOption.value}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  theme === themeOption.value || (!theme && themeOption.value === 'default')
                    ? 'ring-2 ring-primary' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleThemeChange(themeOption.value)}
              >
                <CardContent className="p-4">
                  {/* Theme Preview */}
                  <div 
                    className="w-full h-16 rounded-lg mb-3 relative overflow-hidden"
                    style={{ 
                      background: themeOption.preview,
                      border: '1px solid hsl(var(--border))'
                    }}
                  >
                    {(theme === themeOption.value || (!theme && themeOption.value === 'default')) && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-white dark:bg-black rounded-full p-1">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Theme Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{themeOption.name}</h3>
                      {(theme === themeOption.value || (!theme && themeOption.value === 'default')) && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
              <span className="text-sm">Primary Color</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-secondary"></div>
              <span className="text-sm">Secondary Color</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <span className="text-sm">Accent Color</span>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <p className="text-card-foreground">This is how cards will look with your selected theme.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSettings;