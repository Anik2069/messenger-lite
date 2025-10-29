import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import Image from "next/image";
import { DummyAvatar } from "@/assets/image";

import AnimatedWrapper from "@/components/animations/AnimatedWrapper";
import { SOCKET_HOST } from "@/constant";
import { Check, X } from "lucide-react";
import { ProfileImage } from "./ProfileImage";

const ProfileSettings = () => {
  const { currentUserDetails, updateProfilePicture } = useAuth();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    currentUserDetails?.avatar
      ? `${SOCKET_HOST}/${currentUserDetails.avatar}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (currentUserDetails) {
      setProfileData({
        username: currentUserDetails.username || "",
        email: currentUserDetails.email || "",
        avatar: currentUserDetails.avatar || "",
      });
    }
  }, [currentUserDetails]);

  useEffect(() => {
    if (currentUserDetails?.avatar) {
      setProfileImagePreview(`${SOCKET_HOST}/${currentUserDetails.avatar}`);
    } else {
      setProfileImagePreview(null);
    }
  }, [currentUserDetails]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating profile:", profileData);
  };

  const discardProfile = () => {
    setProfileImageFile(null);
    if (currentUserDetails?.avatar) {
      setProfileImagePreview(`${SOCKET_HOST}/${currentUserDetails.avatar}`);
    } else {
      setProfileImagePreview(null);
    }
  };

  const saveProfile = async () => {
    if (!profileImageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", profileImageFile);
      await updateProfilePicture(formData);
    } catch (error) {
      console.log(error);
    } finally {
      setProfileImageFile(null);
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile Settings
        </CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {currentUserDetails ? (
              <div className="mx-auto relative">
                <ProfileImage
                  className="w-32 h-32"
                  loading={loading}
                  currentImage={profileImagePreview}
                  onImageChange={(file, preview) => {
                    setProfileImageFile(file);
                    setProfileImagePreview(preview);
                  }}
                />

                {profileImageFile && (
                  <AnimatedWrapper
                    type="fade"
                    duration={200}
                    className="flex justify-center gap-2 mt-2"
                  >
                    <button
                      onClick={discardProfile}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      title="Discard"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={saveProfile}
                      className="p-2 rounded-full bg-green-200 hover:bg-green-300 transition-colors"
                      title="Save"
                    >
                      <Check className="w-4 h-4 text-green-700" />
                    </button>
                  </AnimatedWrapper>
                )}
              </div>
            ) : (
              <div className="mx-auto ring-2 ring-muted rounded-full overflow-hidden">
                <Image
                  width={120}
                  height={120}
                  src={DummyAvatar.src}
                  alt="Profile"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = DummyAvatar.src;
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {currentUserDetails?.email}
            </h3>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  username: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Update Profile
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ProfileSettings;
