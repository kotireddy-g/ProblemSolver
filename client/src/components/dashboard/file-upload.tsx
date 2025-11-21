import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, onCancel, isProcessing }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setError(null);
        onFileUpload(file);
      } else {
        setError('Please upload a valid Excel or CSV file.');
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: isProcessing
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
          <h3 className="text-xl font-bold text-white mb-2">Upload Raw Data</h3>
          <p className="text-sm text-muted-foreground">
            Upload your procurement dump (Excel/CSV). <br/>
            Our AI will auto-map columns and identify bottlenecks.
          </p>
        </div>

        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors relative group overflow-hidden",
            isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20 hover:bg-white/5",
            error && "border-red-500/50 bg-red-500/5"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative z-10">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4 group-hover:text-white transition-colors" />
            <p className="text-sm font-medium text-white mb-1">
              {isDragActive ? "Drop file here" : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              XLSX, XLS, CSV (Max 10MB)
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
           <div className="text-[10px] text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
             <span className="text-primary">Note:</span> We support dynamic column mapping
           </div>
        </div>
      </motion.div>
    </div>
  );
}
