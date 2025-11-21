import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, onCancel, isProcessing }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (validFiles.length === 0) {
      setError('Please upload valid Excel or CSV files.');
      return;
    }
    
    if (validFiles.length !== acceptedFiles.length) {
      setError('Some files were skipped. Only CSV and Excel files are supported.');
    } else {
      setError(null);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 20,
    disabled: isProcessing,
    multiple: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-2xl p-6 relative"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upload Raw Data Files</h3>
          <p className="text-sm text-muted-foreground">
            Upload multiple procurement files (Excel/CSV). <br/>
            Our AI will auto-map columns and identify bottlenecks.
          </p>
        </div>

        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors relative group overflow-hidden",
            isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20 hover:bg-white/5",
            error && "border-red-500/50 bg-red-500/5",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative z-10">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4 group-hover:text-white transition-colors" />
            <p className="text-sm font-medium text-white mb-1">
              {isDragActive ? "Drop files here" : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              Multiple XLSX, XLS, CSV files (Max 10MB each, up to 20 files)
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">{selectedFiles.length} file(s) selected:</p>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                  data-testid={`selected-file-${index}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                    <span className="text-xs text-white truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={isProcessing}
                    className="h-6 w-6 flex-shrink-0"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
            data-testid="button-cancel-upload"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="flex-1 bg-green-500 text-black hover:bg-green-600"
            data-testid="button-start-upload"
          >
            {isProcessing ? 'Processing...' : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
           <div className="text-[10px] text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
             <span className="text-primary">Tip:</span> Upload related files together for better analysis
           </div>
        </div>
      </motion.div>
    </div>
  );
}
