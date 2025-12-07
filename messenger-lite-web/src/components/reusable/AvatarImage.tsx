import React, { useState } from "react";
import Image from "next/image";
import { DummyAvatar } from "@/assets/image";

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc] = useState(src || DummyAvatar.src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      width={32}
      height={32}
      src={hasError ? DummyAvatar.src : imgSrc}
      alt={alt}
      className="rounded-full border-2 border-white object-cover w-full h-full"
      onError={() => {
        if (!hasError) setHasError(true); // prevent infinite loop
      }}
    />
  );
};

export default AvatarImage;
