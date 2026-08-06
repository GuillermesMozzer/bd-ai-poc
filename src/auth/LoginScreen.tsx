import React from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  TextField,
  Alert,
  Button,
} from '@mui/material';

interface LoginScreenProps {
  isLoginLoading: boolean;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string | null;
  handleLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  isLoginLoading,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  handleLogin,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        '@media screen and (max-width: 1280px)': {
          minHeight: '133.33vh',
        },
        '@media screen and (min-width: 1281px) and (max-width: 1366px)': {
          minHeight: '128.2vh',
        },
        '@media screen and (min-width: 1367px) and (max-width: 1440px)': {
          minHeight: '120.5vh',
        },
        '@media screen and (min-width: 1441px) and (max-width: 1600px)': {
          minHeight: '111.1vh',
        },
        '@media screen and (min-width: 1601px) and (max-width: 1920px)': {
          minHeight: '105.3vh',
        },
        '@media screen and (min-width: 1921px)': {
          minHeight: '100vh',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(160deg, #EBEDF0 0%, #DBDDDF 45%, #e0e7ff 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid rgba(37,99,235,0.16)',
          boxShadow: '0 24px 48px rgba(15,23,42,0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
          <Box
            component="img"
            src="/images/bd-symbol-rgb.png"
            alt="BD"
            sx={{
              height: 32,
              width: 'auto',
              display: 'block',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Sign in
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Access your operational workstreams.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isLoginLoading ? (
            <Box sx={{ mb: 0.5, px: 1.5, py: 1.2, borderRadius: 2, bgcolor: '#EBEDF0', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} thickness={6} sx={{ color: '#044ED7' }} />
              <Typography variant="caption" sx={{ color: '#1D74FF', fontWeight: 800 }}>
                Signing in...
              </Typography>
            </Box>
          ) : null}
          <TextField
            label="Email"
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleLogin();
              }
            }}
            fullWidth
            disabled={isLoginLoading}
          />
          <TextField
            label="Password"
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleLogin();
              }
            }}
            fullWidth
            disabled={isLoginLoading}
          />
          {loginError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {loginError}
            </Alert>
          ) : null}
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={isLoginLoading}
            sx={{ mt: 0.5, minHeight: 48, fontWeight: 800 }}
          >
            {isLoginLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginScreen;
