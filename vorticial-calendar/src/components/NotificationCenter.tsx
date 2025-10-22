import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Badge
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Notifications,
  Schedule,
  Instagram,
  Facebook,
  Twitter,
  Edit,
  Publish,
  SkipNext
} from '@mui/icons-material';
import { ContentItem, Folder } from '../types';

interface NotificationCenterProps {
  folders: Folder[];
  currentContent: ContentItem | null;
  onPublish: (content: ContentItem) => void;
  onEdit: (content: ContentItem) => void;
  onSkip: () => void;
  onScheduleNotification: (time: string, content: ContentItem) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  folders,
  currentContent,
  onPublish,
  onEdit,
  onSkip,
  onScheduleNotification
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    times: {
      morning: '09:00',
      afternoon: '15:00',
      evening: '21:00'
    },
    platforms: ['instagram']
  });

  const [scheduledNotifications, setScheduledNotifications] = useState<Array<{
    id: string;
    time: string;
    content: ContentItem;
    folder: Folder;
  }>>([]);

  // Simulate notifications based on current time
  const getCurrentNotification = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    let timeSlot = '';
    if (currentHour >= 6 && currentHour < 12) timeSlot = 'morning';
    else if (currentHour >= 12 && currentHour < 18) timeSlot = 'afternoon';
    else timeSlot = 'evening';

    // Find content from active folders
    const activeFolders = folders.filter(f => f.isActive && f.content.length > 0);
    if (activeFolders.length === 0) return null;

    const randomFolder = activeFolders[Math.floor(Math.random() * activeFolders.length)];
    const unusedContent = randomFolder.content.filter(c => !c.isUsed);
    
    if (unusedContent.length === 0) return null;

    return {
      content: unusedContent[0],
      folder: randomFolder,
      timeSlot
    };
  };

  const currentNotification = getCurrentNotification();

  const handlePublish = () => {
    if (currentNotification) {
      onPublish(currentNotification.content);
    }
  };

  const handleEdit = () => {
    if (currentNotification) {
      onEdit(currentNotification.content);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleScheduleNotification = () => {
    if (currentNotification) {
      const time = prompt('¿A qué hora quieres programar esta publicación? (formato HH:MM)');
      if (time) {
        onScheduleNotification(time, currentNotification.content);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications />
          Centro de Notificaciones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Schedule />}
          onClick={() => setShowSettings(true)}
        >
          Configurar Horarios
        </Button>
      </Box>

      {/* Current Notification */}
      {currentNotification ? (
        <Card sx={{ mb: 3, border: '2px solid #4caf50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`${currentNotification.timeSlot === 'morning' ? 'Mañana' : 
                        currentNotification.timeSlot === 'afternoon' ? 'Tarde' : 'Noche'}`}
                color="primary"
                sx={{ mr: 2 }}
              />
              <Typography variant="h6">
                Te corresponde publicar:
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Carpeta: <strong>{currentNotification.folder.name}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentNotification.folder.description}
            </Typography>

            {currentNotification.content.type === 'image' && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={currentNotification.content.url || URL.createObjectURL(currentNotification.content.file!)}
                  alt="Content preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            )}

            {currentNotification.content.caption && (
              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{currentNotification.content.caption}"
              </Typography>
            )}

            {currentNotification.content.tags && currentNotification.content.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {currentNotification.content.tags.map((tag, index) => (
                  <Chip key={index} label={`#${tag}`} size="small" />
                ))}
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              Tipo: {currentNotification.content.type} | 
              Creado: {currentNotification.content.createdAt.toLocaleDateString()}
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<Publish />}
                onClick={handlePublish}
                sx={{ mr: 1 }}
              >
                Publicar Ahora
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={handleScheduleNotification}
              >
                Programar
              </Button>
            </Box>
            <Button
              variant="text"
              color="error"
              startIcon={<SkipNext />}
              onClick={handleSkip}
            >
              Saltar
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Card sx={{ mb: 3, textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No hay contenido programado para publicar en este momento
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Asegúrate de tener carpetas activas con contenido disponible
          </Typography>
        </Card>
      )}

      {/* Scheduled Notifications */}
      {scheduledNotifications.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Publicaciones Programadas ({scheduledNotifications.length})
          </Typography>
          {scheduledNotifications.map((notification) => (
            <Card key={notification.id} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{notification.time}</strong> - {notification.folder.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.content.caption || 'Sin descripción'}
                    </Typography>
                  </Box>
                  <Chip
                    label={notification.content.type}
                    size="small"
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración de Notificaciones</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.enabled}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  enabled: e.target.checked
                }))}
              />
            }
            label="Notificaciones activadas"
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Horarios de Notificación
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ minWidth: '150px', flex: 1 }}
              label="Mañana"
              type="time"
              value={notificationSettings.times.morning}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                times: { ...prev.times, morning: e.target.value }
              }))}
            />
            <TextField
              sx={{ minWidth: '150px', flex: 1 }}
              label="Tarde"
              type="time"
              value={notificationSettings.times.afternoon}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                times: { ...prev.times, afternoon: e.target.value }
              }))}
            />
            <TextField
              sx={{ minWidth: '150px', flex: 1 }}
              label="Noche"
              type="time"
              value={notificationSettings.times.evening}
              onChange={(e) => setNotificationSettings(prev => ({
                ...prev,
                times: { ...prev.times, evening: e.target.value }
              }))}
            />
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Plataformas Sociales
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { key: 'instagram', label: 'Instagram', icon: <Instagram /> },
              { key: 'facebook', label: 'Facebook', icon: <Facebook /> },
              { key: 'twitter', label: 'Twitter', icon: <Twitter /> }
            ].map((platform) => (
              <Chip
                key={platform.key}
                icon={platform.icon}
                label={platform.label}
                color={notificationSettings.platforms.includes(platform.key) ? 'primary' : 'default'}
                onClick={() => {
                  const isSelected = notificationSettings.platforms.includes(platform.key);
                  setNotificationSettings(prev => ({
                    ...prev,
                    platforms: isSelected
                      ? prev.platforms.filter(p => p !== platform.key)
                      : [...prev.platforms, platform.key]
                  }));
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;