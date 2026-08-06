import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import {
  Mic as MicIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  AutoAwesome as SparkleIcon,
  Edit as EditIcon,
  Description as DocumentIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { AiMessage } from '../types';
import {
  getUrgentAiTasks,
} from '../data';

interface AiHomeScreenProps {
  currentUserFirstName: string;
  aiMessages: AiMessage[];
  handleAiSend: (text: string, options?: { openDrawer?: boolean }) => void;
  setCurrentScreen: (screen: any) => void;
}

export const AiHomeScreen: React.FC<AiHomeScreenProps> = ({
  currentUserFirstName,
  aiMessages,
  handleAiSend,
  setCurrentScreen,
}) => {
  const [homeChatInput, setHomeChatInput] = useState('');
  const [homeChatShowMore, setHomeChatShowMore] = useState(false);

  const urgentAiTasks = getUrgentAiTasks(setCurrentScreen);

  const handleStartNewChat = () => {
    handleAiSend('Start a new session', { openDrawer: false });
  };
  const recentChatCommands = aiMessages
    .filter((message) => message.role === 'user')
    .map((message) => message.text)
    .slice(-8)
    .reverse();

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            minHeight: 'calc(100vh - 120px)',
            borderRadius: 4,
            border: '1px solid #DBDDDF',
            bgcolor: '#ffffffad',
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.5 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '320px minmax(0, 1fr)' },
              gap: 2,
              alignItems: 'stretch',
              minHeight: 'calc(100vh - 180px)',
              direction: 'ltr',
            }}
          >
            <Box sx={{ gridColumn: { xs: '1 / -1', md: '2 / 3' }, order: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: { xs: 0, md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <SparkleIcon sx={{ color: '#FF6E00', fontSize: 34 }} />
                <Typography variant="h3" sx={{ color: '#1D74FF', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  BD Atlas AI
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#3D3F41', fontWeight: 700, mb: 2.5, fontSize: { xs: '1.75rem', md: '2.2rem' } }}>
                {`Good morning ${currentUserFirstName}`}
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  maxWidth: 860,
                  p: 2,
                  borderRadius: 4,
                  border: '1px solid #E5E7EB',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  mb: 2,
                }}
              >
                <TextField
                  variant="standard"
                  placeholder="Ask anything"
                  multiline
                  maxRows={4}
                  fullWidth
                  value={homeChatInput}
                  onChange={(event) => setHomeChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleAiSend(homeChatInput, { openDrawer: false });
                      setHomeChatInput('');
                    }
                  }}
                  InputProps={{ disableUnderline: true }}
                  sx={{ px: 1.4, '& .MuiInputBase-input': { fontWeight: 500, fontSize: '1rem', color: '#374151' } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <IconButton size="small"><MicIcon sx={{ color: '#1D74FF', fontSize: 22 }} /></IconButton>
                  <IconButton size="small"><CloudUploadIcon sx={{ color: '#1D74FF', fontSize: 22 }} /></IconButton>
                  <IconButton
                    size="small"
                    onClick={() => { handleAiSend(homeChatInput, { openDrawer: false }); setHomeChatInput(''); }}
                    sx={{
                      bgcolor: '#1D74FF',
                      color: 'white',
                      p: 1.2,
                      '&:hover': { bgcolor: '#044ED7' }
                    }}
                  >
                    <SendIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Paper>
              <Typography variant="body2" sx={{ color: '#626465', mb: 3.2 }}>
                Search across time series data, documents, training materials, assets, and more
              </Typography>

              <Box sx={{ width: '100%', maxWidth: 900, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2.2 }}>
                {[
                  'Open document management',
                  'Open maintenance hub',
                  'Open shift schedule',
                  'Open artifact employee handbook',
                  'How are my assets today?',
                  'Give me site overview',
                ].map((quickPrompt) => (
                  <Chip
                    key={quickPrompt}
                    label={quickPrompt}
                    onClick={() => handleAiSend(quickPrompt, { openDrawer: false })}
                    sx={{ bgcolor: '#ffffff', border: '1px solid #DBDDDF', fontWeight: 700 }}
                  />
                ))}
              </Box>

              <Box sx={{ width: '100%', maxWidth: 900 }}>
                <Typography variant="h6" sx={{ textAlign: 'left', fontWeight: 800, color: '#3D3F41', mb: 1.2 }}>
                  Here are your priority actions for today:
                </Typography>
                <Grid container spacing={1.25}>
                  {(homeChatShowMore ? urgentAiTasks : urgentAiTasks.slice(0, 3)).map((task) => (
                    <Grid key={task.title} size={{ xs: 12, md: 4 }}>
                      <Paper
                        elevation={0}
                        onClick={task.action}
                        sx={{
                          p: 1.1,
                          borderRadius: 2,
                          border: '1px solid #DBDDDF',
                          borderLeft: `4px solid ${task.color}`,
                          bgcolor: '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          '&:hover': { borderColor: task.color, transform: 'translateY(-1px)' },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#3D3F41', fontWeight: 800, display: 'block', lineHeight: 1.3 }}>{task.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#626465', display: 'block', mt: 0.4 }}>{task.detail}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 1.2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="text" onClick={() => setHomeChatShowMore((prev) => !prev)} sx={{ color: '#1D74FF', fontWeight: 800 }}>
                    {homeChatShowMore ? 'Show less' : 'Show more'}
                  </Button>
                </Box>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                gridColumn: { xs: '1 / -1', md: '1 / 2' },
                order: 1,
                border: '1px solid #DBDDDF',
                borderRadius: 3,
                bgcolor: '#fbfdff',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
                <Typography variant="subtitle1" sx={{ color: '#1F2366', fontWeight: 800 }}>
                  BD Atlas AI
                </Typography>
                <IconButton size="small" sx={{ color: '#626465' }}>
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                onClick={handleStartNewChat}
                startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: 700,
                  bgcolor: '#044ED7',
                  '&:hover': { bgcolor: '#1D74FF' },
                  borderRadius: 10,
                  py: 1.2,
                  px: 2,
                  mb: 1.5,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  boxShadow: 'none'
                }}
              >
                New chat
              </Button>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                <Button
                  startIcon={<SearchIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    color: '#3D3F41',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  Search chats
                </Button>

              </Box>

              <Box sx={{ mt: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="caption" sx={{ color: '#626465', fontWeight: 800, px: 1.5, mb: 1.5 }}>
                  Recents
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, overflowY: 'auto', pr: 0.5 }}>
                  {(recentChatCommands.length ? recentChatCommands : ['No recent chats']).map((entry, index) => (
                    <Button
                      key={`${entry}-${index}`}
                      variant="text"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        color: '#334155',
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.8,
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      {entry}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
