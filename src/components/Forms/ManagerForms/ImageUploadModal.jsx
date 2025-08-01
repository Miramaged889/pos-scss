import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Upload,
  Image,
  FileText,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  Camera,
  FolderOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ImageUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  maxFiles = 5,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx"],
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state) => state.language);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const newFiles = Array.from(files);

    // Check file count limit
    if (uploadedFiles.length + newFiles.length > maxFiles) {
      toast.error(t("imageUpload.maxFilesError", { maxFiles }));
      return;
    }

    // Validate file types
    const validFiles = newFiles.filter((file) => {
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type);
        }
        return file.type.match(type.replace("*", ".*"));
      });

      if (!isValidType) {
        toast.error(
          t("imageUpload.unsupportedFileType", { fileName: file.name })
        );
      }

      return isValidType;
    });

    // Check file size (max 10MB per file)
    const sizeValidFiles = validFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("imageUpload.fileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    // Create file objects with preview
    const filesWithPreview = sizeValidFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      uploadDate: new Date(),
      status: "pending",
    }));

    setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(t("imageUpload.noFilesSelected"));
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update file status
      setUploadedFiles((prev) =>
        prev.map((file) => ({ ...file, status: "uploaded" }))
      );

      // Call onSubmit with the uploaded files
      onSubmit(uploadedFiles);

      toast.success(t("imageUpload.uploadSuccess"));
    } catch {
      toast.error(t("imageUpload.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
    setIsDragging(false);
    setIsUploading(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    if (fileType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div
          className={`inline-block w-full max-w-2xl p-6 my-8 overflow-hidden align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title || t("imageUpload.title")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description || t("imageUpload.description")}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(",")}
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("imageUpload.dragDropText")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("imageUpload.supportedFormats")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t("imageUpload.fileLimits", { maxFiles })}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FolderOpen
                      className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`}
                    />
                    {t("imageUpload.selectFiles")}
                  </button>
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} />
                    {t("imageUpload.takePhoto")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("imageUpload.uploadedFiles", {
                  count: uploadedFiles.length,
                  maxFiles,
                })}
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} •{" "}
                          {file.uploadDate.toLocaleDateString(
                            isRTL ? "ar-SA" : "en-US"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {file.status === "uploaded" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {file.status === "pending" && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}

                      {file.preview && (
                        <button
                          onClick={() => window.open(file.preview, "_blank")}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploadedFiles.length === 0 || isUploading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <div
                    className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${
                      isRTL ? "mr-2" : "ml-2"
                    }`}
                  />
                  {t("imageUpload.uploading")}
                </>
              ) : (
                <>
                  <Upload className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} />
                  {t("imageUpload.uploadFiles")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
