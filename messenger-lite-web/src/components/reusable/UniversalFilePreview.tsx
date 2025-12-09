'use client';

import React, { useEffect, useState } from 'react';

/**
 * UniversalFilePreview — Compact universal preview for image, video, PDF, and Word files.
 * ✅ Accepts File objects or URLs
 * ✅ Inline preview for image/video/PDF
 * ✅ Download link for unsupported formats (e.g. Word)
 * ✅ Fixed size (w-40 h-40)
 */
interface UniversalFilePreviewProps {
  file: File | string | null;
}

const UniversalFilePreview: React.FC<UniversalFilePreviewProps> = ({ file }) => {
  const className = 'w-40 h-40 object-contain rounded-md border';
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    if (!file) {
      setFileUrl('');
      setFileType('');
      return;
    }

    // Handle File objects
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
      setFileType(file.type);

      // Cleanup when file changes or component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      // Handle file URLs (string)
      setFileUrl(file);

      const ext = file.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFileType('application/pdf');
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || ''))
        setFileType(`image/${ext}`);
      else if (['mp4', 'webm', 'ogg'].includes(ext || '')) setFileType(`video/${ext}`);
      else if (['doc', 'docx'].includes(ext || '')) setFileType('application/msword');
      else setFileType('');
    }
  }, [file]);

  // No file selected
  if (!fileUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/20`}>
        <p className="text-xs text-muted-foreground">No file selected</p>
      </div>
    );
  }

  // PDF Preview
  if (fileType === 'application/pdf') {
    return (
      <iframe
        src={fileUrl}
        title="PDF Preview"
        className={className}
        style={{ background: 'transparent' }}
      />
    );
  }

  // Word (doc/docx)
  if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return (
      <div className={`${className} flex items-center justify-center text-center p-2`}>
        <p className="text-xs text-muted-foreground">
          Word file preview not supported.
          <br />
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open / Download
          </a>
        </p>
      </div>
    );
  }

  // Image Preview
  if (fileType.startsWith('image/')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fileUrl} alt="Image Preview" className={`${className} object-cover`} />
    );
  }

  // Video Preview
  if (fileType.startsWith('video/')) {
    return <video src={fileUrl} controls className={`${className} object-cover rounded-md`} />;
  }

  // Unsupported
  return (
    <div className={`${className} flex items-center justify-center bg-muted/20`}>
      <p className="text-xs text-muted-foreground">Preview not supported</p>
    </div>
  );
};

export default UniversalFilePreview;
