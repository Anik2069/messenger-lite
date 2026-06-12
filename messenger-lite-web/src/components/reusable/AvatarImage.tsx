import React, { useState } from 'react';
import Image from 'next/image';
import { DummyAvatar } from '@/assets/image';

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);
  // console.log(src, "----------src")
  return (
    <Image
      width={32}
      height={32}
      src={hasError ? DummyAvatar.src : src}
      alt={alt}
      className="rounded-full border-2 border-white object-cover w-full h-full"
      onError={() => {
        if (!hasError) setHasError(true); // prevent infinite loop
      }}
    />
  );
};

export default AvatarImage;
