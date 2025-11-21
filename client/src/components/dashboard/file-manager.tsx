import { FileText, X, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

interface FileManagerProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
  onResetAll: () => void;
  onAddMore: () => void;
}

export function FileManager({ files, onRemoveFile, onResetAll, onAddMore }: FileManagerProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="p-4 bg-white/5 border-white/10" data-testid="card-file-manager">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-white">Uploaded Files</h3>
          <Badge variant="secondary" className="text-xs">{files.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddMore}
            data-testid="button-add-more-files"
            className="text-xs"
          >
            Add More Files
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            data-testid="button-reset-all"
            className="text-xs text-red-400 hover:text-red-300"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover-elevate"
              data-testid={`file-item-${file.id}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate" data-testid={`text-filename-${file.id}`}>
                    {file.originalName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>•</span>
                    <span>{format(new Date(file.uploadedAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFile(file.id)}
                data-testid={`button-remove-${file.id}`}
                className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}
