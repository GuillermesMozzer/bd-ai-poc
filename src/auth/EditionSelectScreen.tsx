import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  APP_EDITION_META,
  type AppEdition,
  useEditionContext,
} from '../common/contexts/EditionContext';

const ICONS: Record<AppEdition, React.ReactNode> = {
  classic: <FactoryIcon sx={{ fontSize: 34 }} />,
  inside_logistics: <LocalShippingIcon sx={{ fontSize: 34 }} />,
};

/**
 * Pre-login gate: choose Smart Factory classic vs Inside Logistics V7.
 */
export default function EditionSelectScreen() {
  const { selectEdition } = useEditionContext();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 3 },
        background:
          'radial-gradient(circle at 12% 18%, rgba(4,78,215,0.16), transparent 42%), radial-gradient(circle at 88% 12%, rgba(255,95,0,0.14), transparent 36%), linear-gradient(160deg, #EBEDF0 0%, #DBDDDF 48%, #e8eefc 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 980 }}>
        <Stack spacing={1.25} sx={{ mb: 3, textAlign: { xs: 'left', md: 'center' } }}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, alignItems: 'center', gap: 1.25 }}>
            <Box
              component="img"
              src="/images/bd-symbol-rgb.png"
              alt="BD"
              sx={{ height: 36, width: 'auto', display: 'block' }}
            />
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.4, color: '#044ED7' }}>
              BD Smart Factory · Radix
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.35rem' }, color: '#0f172a' }}>
            Which version do you want to open?
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', maxWidth: 720, mx: { md: 'auto' } }}>
            Publish once and choose at entry: the current Smart Factory experience or the new Inside Logistics edition
            (widgets + reactive Happy Path).
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {(Object.keys(APP_EDITION_META) as AppEdition[]).map((editionId) => {
            const meta = APP_EDITION_META[editionId];
            const isNew = editionId === 'inside_logistics';
            return (
              <Paper
                key={editionId}
                elevation={0}
                sx={{
                  p: 2.75,
                  borderRadius: 4,
                  border: `1px solid ${isNew ? 'rgba(255,95,0,0.35)' : 'rgba(4,78,215,0.28)'}`,
                  boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  minHeight: 340,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      color: meta.accent,
                      bgcolor: isNew ? 'rgba(255,95,0,0.10)' : 'rgba(4,78,215,0.10)',
                    }}
                  >
                    {ICONS[editionId]}
                  </Box>
                  <Chip
                    label={meta.badge}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: isNew ? '#FF5F00' : '#044ED7',
                      color: '#fff',
                    }}
                  />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {meta.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {meta.description}
                </Typography>

                <Stack spacing={0.85} sx={{ mt: 0.5, flexGrow: 1 }}>
                  {meta.highlights.map((item) => (
                    <Typography key={item} variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      • {item}
                    </Typography>
                  ))}
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => selectEdition(editionId)}
                  sx={{
                    mt: 1,
                    minHeight: 48,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: meta.accent,
                    '&:hover': { bgcolor: meta.accent, filter: 'brightness(0.92)' },
                  }}
                >
                  Continue with {meta.shortTitle}
                </Button>
              </Paper>
            );
          })}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 2.5, textAlign: 'center', color: '#64748b' }}>
          Tip: use <code>?edition=classic</code> or <code>?edition=inside_logistics</code> in the URL for a deep link.
        </Typography>
      </Box>
    </Box>
  );
}
