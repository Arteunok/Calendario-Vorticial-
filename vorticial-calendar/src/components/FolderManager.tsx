import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Edit, Delete, Folder } from '@mui/icons-material';
import { Folder as FolderType } from '../types';

interface FolderManagerProps {
  folders: FolderType[];
  onUpdateFolder: (folder: FolderType) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddFolder: (folder: Omit<FolderType, 'id'>) => void;
  open: boolean;
  onClose: () => void;
}

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
];

const FolderManager: React.FC<FolderManagerProps> = ({
  folders,
  onUpdateFolder,
  onDeleteFolder,
  onAddFolder,
  open,
  onClose
}) => {
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    instructions: '',
    color: predefinedColors[0]
  });

  const handleSaveFolder = () => {
    if (editingFolder) {
      onUpdateFolder(editingFolder);
      setEditingFolder(null);
    } else {
      onAddFolder({
        ...newFolder,
        content: [],
        isActive: true,
        position: folders.length
      });
      setNewFolder({
        name: '',
        description: '',
        instructions: '',
        color: predefinedColors[folders.length % predefinedColors.length]
      });
    }
  };

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder({ ...folder });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gestionar Carpetas Temáticas</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Carpetas Existentes ({folders.length}/9)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {folders.map((folder) => (
              <Box
                key={folder.id}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: folder.color + '20',
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Folder sx={{ color: folder.color, mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {folder.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleEditFolder(folder)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteFolder(folder.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {folder.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Instrucciones: {folder.instructions}
                </Typography>
                <Chip
                  label={`${folder.content.length} elementos`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Add/Edit Folder Form */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                sx={{ minWidth: '200px', flex: 1 }}
                label="Nombre de la Carpeta"
                value={editingFolder?.name || newFolder.name}
                onChange={(e) => {
                  if (editingFolder) {
                    setEditingFolder({ ...editingFolder, name: e.target.value });
                  } else {
                    setNewFolder({ ...newFolder, name: e.target.value });
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
                <Typography variant="body2">Color:</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => {
                        if (editingFolder) {
                          setEditingFolder({ ...editingFolder, color });
                        } else {
                          setNewFolder({ ...newFolder, color });
                        }
                      }}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: (editingFolder?.color || newFolder.color) === color 
                          ? '3px solid #000' 
                          : '1px solid #ccc',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={2}
              value={editingFolder?.description || newFolder.description}
              onChange={(e) => {
                if (editingFolder) {
                  setEditingFolder({ ...editingFolder, description: e.target.value });
                } else {
                  setNewFolder({ ...newFolder, description: e.target.value });
                }
              }}
            />
            <TextField
              fullWidth
              label="Instrucciones de Uso"
              multiline
              rows={3}
              placeholder="Ej: Publicar solo imágenes de productos, usar hashtags específicos, etc."
              value={editingFolder?.instructions || newFolder.instructions}
              onChange={(e) => {
                if (editingFolder) {
                  setEditingFolder({ ...editingFolder, instructions: e.target.value });
                } else {
                  setNewFolder({ ...newFolder, instructions: e.target.value });
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSaveFolder}
          variant="contained"
          disabled={!editingFolder?.name && !newFolder.name}
        >
          {editingFolder ? 'Actualizar' : 'Crear Carpeta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FolderManager;