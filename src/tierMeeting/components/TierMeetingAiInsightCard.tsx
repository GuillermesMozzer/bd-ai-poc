import {Paper, Typography} from '@mui/material';

type TierMeetingAiInsightCardProps = {
  text: string;
};

export default function TierMeetingAiInsightCard({text}: TierMeetingAiInsightCardProps) {
  return (
    <Paper elevation={0} sx={{p: {xs: 0.95, xl: 1.25}, borderRadius: 2.5, bgcolor: '#EBEDF0', border: '1px solid #BFD3FF'}}>
      <Typography variant="caption" sx={{fontWeight: 800, color: '#044ED7', fontSize: {xs: '0.54rem', md: '0.56rem', xl: '0.72rem'}}}>
        AI INSIGHTS
      </Typography>
      <Typography variant="body2" sx={{fontWeight: 700, color: '#1F2366', mt: 0.5, lineHeight: 1.35, fontSize: {xs: '0.68rem', md: '0.72rem', xl: '0.875rem'}}}>
        {text}
      </Typography>
    </Paper>
  );
}
