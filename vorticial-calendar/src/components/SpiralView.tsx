import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Folder, Add, PlayArrow, Pause } from '@mui/icons-material';
import { Folder as FolderType } from '../types';

interface SpiralViewProps {
  folders: FolderType[];
  onFolderClick: (folder: FolderType) => void;
  onAddContent: (folderId: string) => void;
  cycleSettings: {
    isActive: boolean;
    currentFolderIndex: number;
  };
  onToggleCycle: () => void;
}

const SpiralView: React.FC<SpiralViewProps> = ({
  folders,
  onFolderClick,
  onAddContent,
  cycleSettings,
  onToggleCycle
}) => {
  // Generate spiral positions (9 positions in a spiral pattern)
  const getSpiralPosition = (index: number) => {
    const angle = (index * 40) - 90; // Start from top, 40 degrees apart
    const radius = 120 + (index * 15); // Increasing radius for spiral effect
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y };
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '600px',
        height: '600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(252,70,107,0.1) 100%)',
        borderRadius: '50%',
        border: '2px solid rgba(63,94,251,0.3)',
        overflow: 'hidden'
      }}
    >
      {/* Spiral path visualization */}
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '1px solid rgba(63,94,251,0.2)',
          borderRadius: '50%',
          borderStyle: 'dashed'
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Center control panel */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          zIndex: 10
        }}
      >
        <IconButton
          onClick={onToggleCycle}
          sx={{
            width: 60,
            height: 60,
            backgroundColor: cycleSettings.isActive ? '#4caf50' : '#f44336',
            color: 'white',
            '&:hover': {
              backgroundColor: cycleSettings.isActive ? '#45a049' : '#da190b',
            }
          }}
        >
          {cycleSettings.isActive ? <Pause /> : <PlayArrow />}
        </IconButton>
        <Typography variant="caption" sx={{ color: 'white', textAlign: 'center' }}>
          {cycleSettings.isActive ? 'Ciclo Activo' : 'Ciclo Pausado'}
        </Typography>
      </Box>

      {/* Folder positions */}
      {folders.map((folder, index) => {
        const position = getSpiralPosition(index);
        const isCurrentFolder = cycleSettings.currentFolderIndex === index;
        
        return (
          <motion.div
            key={folder.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
              zIndex: 5
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip title={`${folder.name} - ${folder.content.length} elementos`} arrow>
              <Box
                onClick={() => onFolderClick(folder)}
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: folder.color,
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: isCurrentFolder ? '3px solid #ffeb3b' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isCurrentFolder 
                    ? '0 0 20px rgba(255,235,59,0.6)' 
                    : '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                  }
                }}
              >
                <Folder sx={{ color: 'white', fontSize: 24 }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white', 
                    fontSize: '10px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {folder.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white', 
                    fontSize: '8px',
                    textAlign: 'center'
                  }}
                >
                  {folder.content.length}
                </Typography>
              </Box>
            </Tooltip>
            
            {/* Add content button */}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onAddContent(folder.id);
              }}
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 24,
                height: 24,
                backgroundColor: '#2196f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2',
                }
              }}
            >
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          </motion.div>
        );
      })}

      {/* Spiral animation lines */}
      {folders.map((_, index) => {
        const position = getSpiralPosition(index);
        return (
          <motion.div
            key={`line-${index}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '2px',
              height: `${Math.sqrt(position.x * position.x + position.y * position.y)}px`,
              backgroundColor: 'rgba(63,94,251,0.3)',
              transformOrigin: '0 0',
              transform: `translate(-50%, -50%) rotate(${Math.atan2(position.y, position.x) * 180 / Math.PI}deg)`,
              zIndex: 1
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        );
      })}
    </Box>
  );
};

export default SpiralView;