"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Home,
  RefreshCw,
  Wifi,
  WifiOff,
  HelpCircle,
  Mail,
  MoveLeft,
  ArrowUpLeftFromSquareIcon,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Main Error Card */}
        <Card className="shadow-2xl border-0 py-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 overflow-hidden">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center text-white flex items-center justify-center  gap-4">
              <div className=" w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className=" flex flex-col items-start">
                <h1 className="text-4xl font-bold ">404</h1>
                <p className="text-blue-100 text-lg">Page Not Found</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Main Message */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Oops! This page doesn&apos;t exist
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  The page you&apos;re looking for might have been moved,
                  deleted, or you entered the wrong URL. Don&apos;t worry,
                  let&apos;s get you back on track!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base font-medium">
                    <Home className="w-5 h-5 " />
                    Return to Messenger Lite
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-blue-300 hover:text-blue-600"
                >
                  <RefreshCw className="w-5 h-5 " />
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-blue-300 hover:text-blue-600"
                >
                  <ChevronLeft className="w-5 h-5 " />
                  Go Back
                </Button>
              </div>

              {/* Support Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Still having trouble? We&apos;re here to help!
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <Mail className="w-4 h-4 mr-1" />
                    Contact Support
                  </button>
                  <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help Center
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Messenger Lite Web - Fast, Simple, Efficient</p>
        </div>
      </div>
    </div>
  );
}
