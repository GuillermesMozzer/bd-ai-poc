import { workstationVisuals } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AccountTreeOutlined as TeamIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import {useEscalationTags} from './escalationTagsStore';

function tierBadgeSx(tier: string) {
  if (tier === 'Tier 1') {
    return {
      bgcolor: '#EAF3FF',
      color: '#0B55D9',
      border: '1px solid #C9DEFF',
    };
  }

  if (tier === 'Tier 2') {
    return {
      bgcolor: '#FFF4E8',
      color: '#C96A00',
      border: '1px solid #FFD6A8',
    };
  }

  return {
    bgcolor: '#F3EDFF',
    color: '#6A3FD1',
    border: '1px solid #D8C8FF',
  };
}

function statusBadgeSx(status: string) {
  if (status === 'Open') {
    return {
      bgcolor: '#FFF1F1',
      color: '#C61F1F',
      border: '1px solid #FFC8C8',
    };
  }

  if (status === 'In Review') {
    return {
      bgcolor: '#FFF7E8',
      color: '#B96A00',
      border: '1px solid #FFD89C',
    };
  }

  if (status === 'Mitigated') {
    return {
      bgcolor: '#EBFAEF',
      color: '#1E8E4A',
      border: '1px solid #BEE9C8',
    };
  }

  return {
    bgcolor: '#F3EDFF',
    color: '#6A3FD1',
    border: '1px solid #D8C8FF',
  };
}

function FooterIcon({type}: {type: string}) {
  if (type === 'close') {
    return (
      <Box sx={{width: 22, height: 22, borderRadius: '50%', border: '1px solid #C9D4E5', display: 'grid', placeItems: 'center'}}>
        <CloseIcon sx={{fontSize: 16, color: '#35A852'}} />
      </Box>
    );
  }

  if (type === 'tt') {
    return (
      <Box sx={{width: 22, height: 22, borderRadius: '50%', border: '1px solid #C9D4E5', display: 'grid', placeItems: 'center', color: '#35A852', fontSize: 11, fontWeight: 900}}>
        TT
      </Box>
    );
  }

  return (
    <Box sx={{width: 22, height: 22, borderRadius: '50%', border: '1px solid #C9D4E5', display: 'grid', placeItems: 'center'}}>
      <TeamIcon sx={{fontSize: 15, color: '#667085'}} />
    </Box>
  );
}

export default function MyEscalationTagsWidget() {
  const {tags} = useEscalationTags();
  const lanes = [
    {id: 'S', label: 'SAFETY'},
    {id: 'Q', label: 'QUALITY'},
    {id: 'D', label: 'DELIVERY'},
    {id: 'C', label: 'COST'},
    {id: 'P', label: 'PEOPLE'},
  ] as const;

  return (
    <Paper elevation={0} sx={{
      width: '100%',
      height: '100%',
      minHeight: 180,
      p: 'clamp(10px, 2cqw, 14px)',
      borderRadius: 1.8,
      bgcolor: '#FFFFFF',
      border: '1px solid #DDE4EF',
      boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
      overflow: 'hidden',
      containerType: 'inline-size',
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr)',
      gap: 1,
      '@container (max-width: 520px)': {
        '& .escalation-tags-header': {
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        },
        '& .escalation-tags-grid': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
      },
      '@container (max-width: 300px)': {
        '& .escalation-tags-grid': {
          gridTemplateColumns: 'minmax(0, 1fr)',
        },
      },
    }}>
      <Box className="escalation-tags-header" sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 0.5}}>
        <Typography sx={{fontSize: 'clamp(16px, 3.4cqw, 20px)', lineHeight: 1, color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>
          Open Issues
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, color: '#1473FF'}}>
          <Typography sx={{fontSize: 13, fontWeight: 800}}>View All</Typography>
          <OpenInFullIcon sx={{fontSize: 18}} />
        </Box>
      </Box>
      <Box className="escalation-tags-grid" sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.8, minWidth: 0, minHeight: 0}}>
        {lanes.map((lane) => {
          const laneTags = tags.filter((tag) => tag.code === lane.id);
          const tag = laneTags[0];

          return (
            <Box key={lane.id} sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', gap: 0.55, minHeight: 0}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.2}}>
                <Typography sx={{fontSize: 13, color: '#334155', fontWeight: 900, letterSpacing: 0.6}}>
                  {lane.label}
                </Typography>
                <Typography sx={{fontSize: 11, color: '#94A3B8', fontWeight: 800}}>
                  {laneTags.length} ISSUES
                </Typography>
              </Box>
              {tag ? (
                <Paper elevation={0} sx={{
                  position: 'relative',
                  minHeight: 126,
                  p: 1.2,
                  pl: 1.5,
                  borderRadius: 1.4,
                  border: '1px solid #E4E8EF',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.02)',
                  overflow: 'hidden',
                }}>
                  <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: tag.color}} />
                  <Box sx={{display: 'grid', gridTemplateColumns: '34px 1fr 22px', gap: 0.9, alignItems: 'start'}}>
                    <Box sx={{width: 32, height: 32, borderRadius: '50%', bgcolor: tag.color, color: '#000000', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900}}>
                      {tag.code}
                    </Box>
                    <Typography sx={{fontSize: 14, lineHeight: 1.24, color: '#2F3547', fontWeight: 600, minHeight: 52}}>
                      {tag.title}
                    </Typography>
                    <IconButton size="small" sx={{width: 22, height: 22, p: 0, color: '#1473FF'}}>
                      <MoreIcon sx={{fontSize: 20}} />
                    </IconButton>
                  </Box>
                  <Box sx={{ml: 4.9, mt: 0.25}}>
                    <Box sx={{display: 'inline-flex', px: 0.7, py: 0.25, borderRadius: 0.7, border: `1px solid ${tag.levelColor}`, color: tag.levelColor, bgcolor: tag.levelColor === '#FF3838' ? '#FFF2F2' : '#FFF7ED', fontSize: 13, fontWeight: 700}}>
                      {tag.level}
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.45, mt: 0.65}}>
                      <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 30, px: 0.7, py: 0.22, borderRadius: 999, fontSize: 10.5, lineHeight: 1.1, fontWeight: 900, ...tierBadgeSx(tag.fromTier)}}>
                        {tag.fromTier.replace('Tier ', 'T')}
                      </Box>
                      <Typography sx={{fontSize: 10.5, color: '#7A8699', fontWeight: 900, lineHeight: 1}}>
                        to
                      </Typography>
                      <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 30, px: 0.7, py: 0.22, borderRadius: 999, fontSize: 10.5, lineHeight: 1.1, fontWeight: 900, ...tierBadgeSx(tag.currentTier)}}>
                        {tag.currentTier.replace('Tier ', 'T')}
                      </Box>
                      <Box sx={{display: 'inline-flex', px: 0.7, py: 0.22, borderRadius: 999, fontSize: 10.5, lineHeight: 1.1, fontWeight: 900, ...statusBadgeSx(tag.status)}}>
                        {tag.status}
                      </Box>
                    </Box>
                    <Typography sx={{fontSize: 11.5, color: '#667085', lineHeight: 1.35, mt: 0.7}}>
                      {tag.latestHistory}
                    </Typography>
                  </Box>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.9}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
                      <FooterIcon type={tag.icon} />
                      <Typography sx={{fontSize: 13, color: '#3F4658', fontWeight: 600}}>{tag.owner}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 13, color: '#3F4658', fontWeight: 600}}>{tag.date}</Typography>
                  </Box>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{minHeight: 126, p: 1.1, borderRadius: 1.4, border: '1px dashed #D7E2EF', bgcolor: '#FAFCFF', display: 'grid', placeItems: 'center'}}>
                  <Typography sx={{fontSize: 11.5, color: '#94A3B8', fontWeight: 700}}>No issues</Typography>
                </Paper>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
