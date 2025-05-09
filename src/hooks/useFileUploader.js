import { useState } from 'react';

const useFileUploader = (showPreview) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleAcceptedFiles = (files, onFilesChange) => {
    const updatedFiles = files.map((file) => {
      if (showPreview) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: formatFileSize(file.size),
        });
      }
      return file;
    });
    setSelectedFiles(updatedFiles);
    if (onFilesChange) onFilesChange(updatedFiles); // Call parent handler
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview); // Clean up
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return { selectedFiles, handleAcceptedFiles, removeFile };
};

export default useFileUploader;