"use client";

import type React from "react";

import { useRef, useState } from "react";
import { Camera, Focus } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { DummyAvatar } from "@/assets/image";
import Image from "next/image";

interface ProfileImageProps {
  loading?: boolean;
  currentImage: string | null;
  onImageChange: (file: File, preview: string) => void;
  className?: string;
}

export function ProfileImage({
  loading,
  currentImage,
  onImageChange,
  className,
}: ProfileImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, JPEG, PNG, WEBP, or SVG)");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    onImageChange(file, previewUrl);
  };

  return (
    <div
      className={`${className} relative rounded-full overflow-hidden cursor-pointer border-4 border-white bg-muted `}
      onClick={handleImageClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <>
        <Image
          width={120}
          height={120}
          src={currentImage ? currentImage : DummyAvatar.src}
          alt="Profile"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = DummyAvatar.src;
            e.currentTarget.onerror = null;
          }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Spinner />
          </div>
        )}
        {!isHovering && (
          <div className="absolute inset-0 bg-black/10 py-1 flex items-end mt-auto h-fit justify-center text-white text-sm">
            <Camera className="h-4 w-4" />
          </div>
        )}
        {isHovering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
            Click to change
          </div>
        )}
      </>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,.svg"
        className="hidden"
      />
    </div>
  );
}
