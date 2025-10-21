import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Container, Tabs, Tab } from '@mui/material';
import { 
  Folder, 
  Notifications, 
  Settings, 
  PlayArrow, 
  Pause,
  Instagram
} from '@mui/icons-material';

import SpiralView from './components/SpiralView';
import FolderManager from './components/FolderManager';
import ContentUploader from './components/ContentUploader';
import NotificationCenter from './components/NotificationCenter';
import { Folder as FolderType, ContentItem, CycleSettings } from './types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showContentUploader, setShowContentUploader] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    isActive: false,
    startDate: new Date(),
    intervalDays: 3,
    notificationTimes: {
      morning: '09:00',
      afternoon: '15:00',
      evening: '21:00'
    },
    currentFolderIndex: 0
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleFolders: FolderType[] = [
      {
        id: '1',
        name: 'Productos',
        description: 'Contenido relacionado con productos y servicios',
        instructions: 'Publicar solo imágenes de alta calidad, incluir precios y descripciones',
        color: '#FF6B6B',
        content: [],
        isActive: true,
        position: 0
      },
      {
        id: '2',
        name: 'Lifestyle',
        description: 'Contenido de estilo de vida y experiencias',
        instructions: 'Enfoque en momentos auténticos, usar hashtags de lifestyle',
        color: '#4ECDC4',
        content: [],
        isActive: true,
        position: 1
      },
      {
        id: '3',
        name: 'Educativo',
        description: 'Tips, tutoriales y contenido educativo',
        instructions: 'Formato carrusel para tutoriales, incluir captions informativos',
        color: '#45B7D1',
        content: [],
        isActive: true,
        position: 2
      }
    ];
    setFolders(sampleFolders);
  }, []);

  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolderId(folder.id);
    setShowContentUploader(true);
  };

  const handleAddContent = (folderId: string) => {
    setSelectedFolderId(folderId);
    setShowContentUploader(true);
  };

  const handleContentUpload = (content: ContentItem[]) => {
    if (selectedFolderId) {
      setFolders(prev => prev.map(folder => 
        folder.id === selectedFolderId 
          ? { ...folder, content: [...folder.content, ...content] }
          : folder
      ));
    }
  };

  const handleUpdateFolder = (updatedFolder: FolderType) => {
    setFolders(prev => prev.map(folder => 
      folder.id === updatedFolder.id ? updatedFolder : folder
    ));
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const handleAddFolder = (newFolder: Omit<FolderType, 'id'>) => {
    const folder: FolderType = {
      ...newFolder,
      id: Date.now().toString(),
      content: [],
      isActive: true,
      position: folders.length
    };
    setFolders(prev => [...prev, folder]);
  };

  const handleToggleCycle = () => {
    setCycleSettings(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handlePublish = (content: ContentItem) => {
    // Mark content as used
    setFolders(prev => prev.map(folder => ({
      ...folder,
      content: folder.content.map(item => 
        item.id === content.id ? { ...item, isUsed: true } : item
      )
    })));
    
    // Move to next folder in cycle
    setCycleSettings(prev => ({
      ...prev,
      currentFolderIndex: (prev.currentFolderIndex + 1) % folders.length
    }));
  };

  const handleEdit = (content: ContentItem) => {
    // Open content editor
    console.log('Edit content:', content);
  };

  const handleSkip = () => {
    // Move to next content in current folder
    setCycleSettings(prev => ({
      ...prev,
      currentFolderIndex: (prev.currentFolderIndex + 1) % folders.length
    }));
  };

  const handleScheduleNotification = (time: string, content: ContentItem) => {
    console.log('Schedule notification:', time, content);
  };

  const getCurrentContent = (): ContentItem | null => {
    if (folders.length === 0) return null;
    const currentFolder = folders[cycleSettings.currentFolderIndex];
    const unusedContent = currentFolder.content.filter(c => !c.isUsed);
    return unusedContent.length > 0 ? unusedContent[0] : null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Calendario Vorticial de Publicación
            </Typography>
            <Button
              color="inherit"
              startIcon={<Instagram />}
              sx={{ mr: 2 }}
            >
              Conectar Instagram
            </Button>
            <Button
              color="inherit"
              startIcon={cycleSettings.isActive ? <Pause /> : <PlayArrow />}
              onClick={handleToggleCycle}
            >
              {cycleSettings.isActive ? 'Pausar Ciclo' : 'Iniciar Ciclo'}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab icon={<Folder />} label="Calendario Vorticial" />
            <Tab icon={<Notifications />} label="Notificaciones" />
            <Tab icon={<Settings />} label="Configuración" />
          </Tabs>

          {currentTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Calendario Vorticial
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Folder />}
                  onClick={() => setShowFolderManager(true)}
                >
                  Gestionar Carpetas ({folders.length}/9)
                </Button>
              </Box>

              <SpiralView
                folders={folders}
                onFolderClick={handleFolderClick}
                onAddContent={handleAddContent}
                cycleSettings={cycleSettings}
                onToggleCycle={handleToggleCycle}
              />

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Haz clic en una carpeta para añadir contenido o gestionar las carpetas temáticas
                </Typography>
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <NotificationCenter
              folders={folders}
              currentContent={getCurrentContent()}
              onPublish={handlePublish}
              onEdit={handleEdit}
              onSkip={handleSkip}
              onScheduleNotification={handleScheduleNotification}
            />
          )}

          {currentTab === 2 && (
            <Box>
              <Typography variant="h4" gutterBottom>
                Configuración
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Aquí podrás configurar los horarios de notificación, plataformas sociales y preferencias del sistema.
              </Typography>
            </Box>
          )}
        </Container>

        <FolderManager
          folders={folders}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddFolder={handleAddFolder}
          open={showFolderManager}
          onClose={() => setShowFolderManager(false)}
        />

        <ContentUploader
          open={showContentUploader}
          onClose={() => setShowContentUploader(false)}
          onUpload={handleContentUpload}
          folderName={folders.find(f => f.id === selectedFolderId)?.name || ''}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;