import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; componentStack: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '', componentStack: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message ?? 'Unexpected runtime error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App runtime error:', error);
    this.setState({ componentStack: info.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#EBEDF0' }}>
          <Paper elevation={0} sx={{ p: 3, maxWidth: 560, width: '100%', borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fff7f7' }}>
            <Typography variant="h6" sx={{ color: '#991b1b', fontWeight: 800, mb: 1 }}>
              Screen failed to load
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f1d1d', mb: 2 }}>
              {this.state.message || 'Unknown error'}
            </Typography>
            {this.state.componentStack ? (
              <Box
                component="pre"
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  color: '#7f1d1d',
                  border: '1px solid #fecaca',
                  whiteSpace: 'pre-wrap',
                  fontSize: 11,
                  lineHeight: 1.45,
                  overflowX: 'auto',
                }}
              >
                {this.state.componentStack.trim()}
              </Box>
            ) : null}
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ bgcolor: '#E43B46', '&:hover': { bgcolor: '#b91c1c' } }}>
              Reload
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
