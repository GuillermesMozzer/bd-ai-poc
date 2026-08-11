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
import BdLogo from '../common/components/BdLogo';
import { focusVisibleSx } from '../logistics/a11y';
import { logisticsType } from '../logistics/typography';

const ICONS: Record<AppEdition, React.ReactNode> = {
  classic: <FactoryIcon sx={{ fontSize: 26 }} aria-hidden />,
  inside_logistics: <LocalShippingIcon sx={{ fontSize: 26 }} aria-hidden />,
};

/**
 * Pre-login gate: choose Smart Factory classic vs Inside Logistics V7.
 */
export default function EditionSelectScreen() {
  const { selectEdition } = useEditionContext();

  return (
    <Box
      component="main"
      aria-labelledby="edition-select-heading"
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
      <Box sx={{ width: '100%', maxWidth: 880 }}>
        <Stack spacing={1} sx={{ mb: 2.5, textAlign: { xs: 'left', md: 'center' } }}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, alignItems: 'center' }}>
            <BdLogo surface="onLight" height={36} />
          </Box>
          <Typography
            component="p"
            sx={{ ...logisticsType.overline, color: '#044ED7', mt: 0.5 }}
          >
            Smart Factory · Radix
          </Typography>
          <Typography
            id="edition-select-heading"
            component="h1"
            sx={{ ...logisticsType.pageTitle, fontSize: '1.25rem', color: '#0f172a' }}
          >
            Which version do you want to open?
          </Typography>
          <Typography sx={{ ...logisticsType.pageSubtitle, color: '#334155', maxWidth: 640, mx: { md: 'auto' } }}>
            Publish once and choose at entry: the current Smart Factory experience or the new Inside Logistics edition
            (widgets + reactive Happy Path).
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.75,
          }}
          role="list"
          aria-label="Available app versions"
        >
          {(Object.keys(APP_EDITION_META) as AppEdition[]).map((editionId) => {
            const meta = APP_EDITION_META[editionId];
            const isNew = editionId === 'inside_logistics';
            return (
              <Paper
                key={editionId}
                elevation={0}
                role="listitem"
                component="article"
                aria-labelledby={`edition-title-${editionId}`}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  border: `2px solid ${isNew ? '#C2410C' : '#044ED7'}`,
                  boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.1,
                  minHeight: 280,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      color: meta.accent,
                      bgcolor: isNew ? 'rgba(194,65,12,0.12)' : 'rgba(4,78,215,0.10)',
                    }}
                  >
                    {ICONS[editionId]}
                  </Box>
                  <Chip
                    label={meta.badge}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 22,
                      bgcolor: isNew ? '#C2410C' : '#044ED7',
                      color: '#fff',
                    }}
                  />
                </Box>

                <Typography
                  id={`edition-title-${editionId}`}
                  component="h2"
                  sx={{ ...logisticsType.sectionTitle, fontSize: '1rem', color: '#0f172a' }}
                >
                  {meta.title}
                </Typography>
                <Typography sx={{ ...logisticsType.body, color: '#334155' }}>
                  {meta.description}
                </Typography>

                <Box component="ul" sx={{ mt: 0.25, flexGrow: 1, pl: 2, m: 0 }}>
                  {meta.highlights.map((item) => (
                    <Typography
                      key={item}
                      component="li"
                      sx={{ ...logisticsType.caption, color: '#1e293b', mb: 0.55 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  size="medium"
                  endIcon={<ArrowForwardIcon aria-hidden sx={{ fontSize: 18 }} />}
                  onClick={() => selectEdition(editionId)}
                  aria-label={`Continue with ${meta.shortTitle}`}
                  sx={{
                    mt: 0.5,
                    minHeight: 40,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    bgcolor: isNew ? '#C2410C' : '#044ED7',
                    ...focusVisibleSx,
                    '&:hover': { bgcolor: isNew ? '#9A3412' : '#033ba8' },
                  }}
                >
                  Continue with {meta.shortTitle}
                </Button>
              </Paper>
            );
          })}
        </Box>

        <Typography sx={{ display: 'block', mt: 2, textAlign: 'center', ...logisticsType.caption, color: '#334155' }}>
          Tip: use <code>?edition=classic</code> or <code>?edition=inside_logistics</code> in the URL for a deep link.
        </Typography>
      </Box>
    </Box>
  );
}
