import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { FileData } from "../../../types/MessageType";
import { formatFileSize } from "@/lib/utils";

const FileMessage = ({ fileData }: { fileData: FileData }) => {
  const isImage = fileData.mimetype.startsWith("image/");
  return (
    <div className="mt-2">
      {isImage ? (
        <div className="relative max-w-xs">
          <Image
            src={fileData.url}
            alt={fileData.originalName || "File"}
            width={200}
            height={200}
            className="rounded-lg shadow-sm"
          />
          <a
            href={fileData.url}
            download={fileData.originalName}
            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
          >
            <Download className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
          <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {fileData.originalName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(fileData.size)}
            </p>
          </div>
          <a
            href={fileData.url}
            download={fileData.originalName}
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
