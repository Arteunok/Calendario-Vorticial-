import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  LinearProgress
} from '@mui/material';
import { CloudUpload, Close, Image, VideoFile, TextFields, AudioFile } from '@mui/icons-material';
import { ContentItem } from '../types';

interface ContentUploaderProps {
  open: boolean;
  onClose: () => void;
  onUpload: (content: ContentItem[]) => void;
  folderName: string;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({
  open,
  onClose,
  onUpload,
  folderName
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<{ [key: string]: string }>({});
  const [tags, setTags] = useState<{ [key: string]: string[] }>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    const fileId = files[index]?.name;
    if (fileId) {
      setCaptions(prev => {
        const newCaptions = { ...prev };
        delete newCaptions[fileId];
        return newCaptions;
      });
      setTags(prev => {
        const newTags = { ...prev };
        delete newTags[fileId];
        return newTags;
      });
    }
  };

  const handleCaptionChange = (fileName: string, caption: string) => {
    setCaptions(prev => ({ ...prev, [fileName]: caption }));
  };

  const handleTagAdd = (fileName: string, tag: string) => {
    if (tag.trim()) {
      setTags(prev => ({
        ...prev,
        [fileName]: [...(prev[fileName] || []), tag.trim()]
      }));
    }
  };

  const handleTagRemove = (fileName: string, tagToRemove: string) => {
    setTags(prev => ({
      ...prev,
      [fileName]: (prev[fileName] || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image />;
    if (file.type.startsWith('video/')) return <VideoFile />;
    if (file.type.startsWith('audio/')) return <AudioFile />;
    return <TextFields />;
  };

  const getFileType = (file: File): ContentItem['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'text';
  };

  const handleUpload = async () => {
    setUploading(true);
    
    const contentItems: ContentItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: getFileType(file),
      file,
      caption: captions[file.name] || '',
      tags: tags[file.name] || [],
      createdAt: new Date(),
      isUsed: false
    }));

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onUpload(contentItems);
    setFiles([]);
    setCaptions({});
    setTags({});
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Subir Contenido a "{folderName}"
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mb: 2 }}
            disabled={uploading}
          >
            Seleccionar Archivos
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.txt,.md"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Formatos soportados: Imágenes (JPG, PNG, GIF), Videos (MP4, MOV), Audio (MP3, WAV), Texto (TXT, MD)
          </Typography>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Subiendo archivos...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getFileIcon(file)}
                <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                >
                  <Close />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                label="Descripción/Caption"
                multiline
                rows={2}
                value={captions[file.name] || ''}
                onChange={(e) => handleCaptionChange(file.name, e.target.value)}
                disabled={uploading}
                sx={{ mb: 1 }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Añadir tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd(file.name, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  disabled={uploading}
                />
                <Typography variant="caption" color="text.secondary">
                  Presiona Enter para añadir
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(tags[file.name] || []).map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    label={tag}
                    size="small"
                    onDelete={() => handleTagRemove(file.name, tag)}
                    disabled={uploading}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContentUploader;