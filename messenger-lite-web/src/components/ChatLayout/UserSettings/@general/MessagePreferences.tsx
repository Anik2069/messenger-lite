import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const MessagePreferences = () => {
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Message Preferences
        </CardTitle>
      </CardHeader>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Read Receipts
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Let others see when you&apos;ve read their messages
              </p>
            </div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Typing Indicators
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show when you&apos;re typing
              </p>
            </div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default MessagePreferences;
