'use client';

import Image from 'next/image';
import { Download, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { MEDIA_HOST } from '@/constant';
import AudioPlayer from '@/components/reusable/AudioPlayer';

export type FileMessageType = {
  url?: string;
  filename?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
};

interface FileMessageProps {
  file: FileMessageType;
  className?: string;
}

const FileMessage = ({ file, className }: FileMessageProps) => {
  // console.log(file);
  const url = file.url
    ? `${MEDIA_HOST}${file.url}`
    : file.fileUrl
      ? `${MEDIA_HOST}${file.fileUrl}`
      : '';
  const filename = file.originalName || file.fileName || 'File';
  const mimetype = file.mimetype || file.fileMime || '';
  const size = file.size || file.fileSize || 0;

  // Detect file type
  const isImage = mimetype.startsWith('image/');
  const isVideo = mimetype.startsWith('video/');
  const isAudio = mimetype.startsWith('audio/');

  // Allowed document types
  const allowedDocs = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  // Check if file is allowed
  const isAllowed = isImage || isVideo || allowedDocs.includes(mimetype) || isAudio;
  if (!isAllowed) return null; // skip unsupported files

  return (
    <div className="mt-2">
      {/* Image preview */}
      {isImage && (
        <div
          className={`${className} relative group w-40 h-40 rounded-lg overflow-hidden shadow-sm hover:scale-105 transition-transform`}
        >
          <Image src={url} alt={filename} fill className="object-cover" />
          <a
            href={url}
            target="_blank"
            download={filename}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Video preview */}
      {isVideo && (
        <div className="relative w-40 h-40 rounded-lg overflow-hidden shadow-sm bg-black">
          <video src={url} className="object-cover w-full h-full" controls />
        </div>
      )}

      {/* Audio preview */}
      {isAudio && (
        <div className="relative w-[300px] overflow-hidden ">
          {/* <audio
            controlsList="nodownload"
            src={url}
            className="object-cover w-full h-9"
            controls
          /> */}
          {isAudio && <AudioPlayer src={url} width={300} height={30} />}
        </div>
      )}

      {/* Document preview */}
      {!isImage && !isVideo && !isAudio && (
        <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(size)}</p>
          </div>
          <a
            href={url}
            target="_blank"
            download={filename}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default FileMessage;
