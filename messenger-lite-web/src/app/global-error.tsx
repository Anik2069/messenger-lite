"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageSquare,
  Shield,
  Bug,
} from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl space-y-8">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Critical Error</h1>
                <p className="text-red-100">
                  Messenger Lite has encountered a serious problem
                </p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Error Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center  space-x-3">
                    <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        System Error
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {error.message ||
                          "A critical system error has occurred. The application needs to be restarted."}
                      </p>
                      {error.digest && (
                        <p className="text-xs text-gray-500 mt-2">
                          Error ID:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {error.digest}
                          </code>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3  gap-4">
                  <button
                    onClick={reset}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Restart Application</span>
                  </button>

                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span>Go to Home</span>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Reload Page</span>
                  </button>
                </div>

                {/* Support */}
                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    If this problem persists, please contact support
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact Support
                    </button>
                    <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                      <Bug className="w-4 h-4 mr-1" />
                      Report Bug
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>© 2025 Messenger Lite Web - Fast, Simple, Efficient</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
