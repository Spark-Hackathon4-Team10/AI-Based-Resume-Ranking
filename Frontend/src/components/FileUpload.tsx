import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export const FileUpload = ({ files, onFilesChange, disabled }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip')
    );
    onFilesChange([...files, ...validFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive || dragActive
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="p-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-indigo-100 rounded-full">
              <Upload className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700 mb-2">
                   Upload files here              </p>
              <p className="text-sm text-slate-500">
                PDF or ZIP files only (max 5MB each)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">
                تم اختيار {files.length} ملف
              </span>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-green-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-red-600 mr-3" />
                    <span className="text-sm font-medium text-slate-700">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500 mr-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
