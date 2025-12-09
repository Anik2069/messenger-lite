import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const AppearanceSettings = () => {
  const { settings, toggleTheme } = useSettings();

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Appearance Settings
        </CardTitle>
      </CardHeader>
      <div className="p-6 space-y-6">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.theme === 'DARK' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.theme === 'DARK' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Font Size Options */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Font Size</h4>
          <div className="flex gap-2">
            {['Small', 'Medium', 'Large'].map((size) => (
              <button
                key={size}
                className="flex-1 py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AppearanceSettings;
