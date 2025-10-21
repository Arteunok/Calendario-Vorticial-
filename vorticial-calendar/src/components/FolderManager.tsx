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
  IconButton,
  Grid
} from '@mui/material';
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
          <Grid container spacing={2}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} key={folder.id}>
                <Box
                  sx={{
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
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Add/Edit Folder Form */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Color:</Typography>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
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