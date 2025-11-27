import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Paper, Avatar } from '@mui/material';
import { Person, AccountBalance, FitnessCenter, Work, CalendarToday } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Proposal } from '../../types/Proposal';
import styles from './ProposalDetailsModal.module.css';

interface ProposalDetailsModalProps {
  open: boolean;
  onClose: () => void;
  proposal: Proposal | null;
}

export default function ProposalDetailsModal({ open, onClose, proposal }: ProposalDetailsModalProps) {
  const { statuses, premiumFrequencies } = useSelector((state: RootState) => state.enum);

  if (!proposal) return null;

  const getStatusLabel = (status: number) => {
    const statusEnum = statuses.find(s => s.value === status);
    return statusEnum?.name || 'Unknown';
  };

  const getFrequencyLabel = (frequency: number) => {
    const freqEnum = premiumFrequencies.find(f => f.value === frequency);
    return freqEnum?.name || 'Unknown';
  };

  const getStatusColor = (status: number): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 3: return 'success';
      case 4: return 'error';
      case 2: return 'warning';
      case 21: return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth disableAutoFocus>
      <DialogTitle className={styles.dialogHeader}>
        <Avatar className={styles.headerAvatar}>
          <Person />
        </Avatar>
        <Box className={styles.headerInfo}>
          <Typography variant="h6">Proposal Details</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>ID: {proposal.proposalId}</Typography>
        </Box>
        <Chip 
          label={getStatusLabel(proposal.status)} 
          color={getStatusColor(proposal.status)} 
          className={styles.headerChip}
        />
      </DialogTitle>
      
      <DialogContent className={styles.dialogContent}>
        <Box className={styles.contentContainer}>
          
          {/* Policy Information */}
          <Paper elevation={2} className={styles.sectionPaper}>
            <Box className={styles.sectionHeader}>
              <AccountBalance color="primary" />
              <Typography variant="h6" color="primary">Policy Information</Typography>
            </Box>
            <Box className={`${styles.gridContainer} ${styles.policyGrid}`}>
              <Box className={`${styles.infoCard} ${styles.greyCard}`}>
                <Typography className={styles.caption}>PRODUCT ID</Typography>
                <Typography className={styles.valueText} color="primary">{proposal.productId}</Typography>
              </Box>
              <Box className={`${styles.infoCard} ${styles.greyCard}`}>
                <Typography className={styles.caption}>USER ID</Typography>
                <Typography className={styles.valueText}>{proposal.userId}</Typography>
              </Box>
              <Box className={`${styles.infoCard} ${styles.successCard}`}>
                <Typography className={`${styles.caption} ${styles.captionSuccess}`}>SUM ASSURED</Typography>
                <Typography className={`${styles.valueText} ${styles.valueSuccess}`}>₹{proposal.sumAssured.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box className={`${styles.infoCard} ${styles.warningCard}`}>
                <Typography className={`${styles.caption} ${styles.captionWarning}`}>PREMIUM AMOUNT</Typography>
                <Typography className={`${styles.valueText} ${styles.valueWarning}`}>₹{proposal.premiumAmount.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box className={`${styles.infoCard} ${styles.infoCardColor}`}>
                <Typography className={`${styles.caption} ${styles.captionInfo}`}>TERM</Typography>
                <Typography className={`${styles.valueText} ${styles.valueInfo}`}>{proposal.termYears} Years</Typography>
              </Box>
              <Box className={`${styles.infoCard} ${styles.secondaryCard}`}>
                <Typography className={`${styles.caption} ${styles.captionSecondary}`}>FREQUENCY</Typography>
                <Typography className={`${styles.valueText} ${styles.valueSecondary}`}>{getFrequencyLabel(proposal.premiumFrequency)}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Health Information */}
          <Paper elevation={2} className={styles.sectionPaper}>
            <Box className={styles.sectionHeader}>
              <FitnessCenter color="primary" />
              <Typography variant="h6" color="primary">Health Information</Typography>
            </Box>
            <Box className={`${styles.gridContainer} ${styles.healthGrid}`}>
              <Box className={styles.healthCard}>
                <Typography variant="body2" color="text.secondary">Height</Typography>
                <Typography variant="body1" fontWeight="bold">{proposal.height} cm</Typography>
              </Box>
              <Box className={styles.healthCard}>
                <Typography variant="body2" color="text.secondary">Weight</Typography>
                <Typography variant="body1" fontWeight="bold">{proposal.weight} kg</Typography>
              </Box>
              <Box className={`${styles.healthCard} ${proposal.isSmoker ? styles.healthCardError : styles.healthCardSuccess}`}>
                <Typography variant="body2" color="text.secondary">Smoker</Typography>
                <Chip label={proposal.isSmoker ? 'Yes' : 'No'} color={proposal.isSmoker ? 'error' : 'success'} size="small" />
              </Box>
              <Box className={`${styles.healthCard} ${proposal.isDrinker ? styles.healthCardWarning : styles.healthCardSuccess}`}>
                <Typography variant="body2" color="text.secondary">Drinker</Typography>
                <Chip label={proposal.isDrinker ? 'Yes' : 'No'} color={proposal.isDrinker ? 'warning' : 'success'} size="small" />
              </Box>
            </Box>
          </Paper>

          {/* Personal Information */}
          <Paper elevation={2} className={styles.sectionPaper}>
            <Box className={styles.sectionHeader}>
              <Work color="primary" />
              <Typography variant="h6" color="primary">Personal Information</Typography>
            </Box>
            <Box className={`${styles.gridContainer} ${styles.personalGrid}`}>
              <Box>
                <Typography className={styles.caption}>OCCUPATION</Typography>
                <Typography className={styles.valueText}>{proposal.occupation}</Typography>
              </Box>
              <Box>
                <Typography className={styles.caption}>ANNUAL INCOME</Typography>
                <Typography className={`${styles.valueText} ${styles.valueSuccess}`}>₹{proposal.annualIncome.toLocaleString('en-IN')}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography className={styles.caption}>PRE-EXISTING CONDITIONS</Typography>
              <Paper className={styles.conditionsPaper}>
                <Typography variant="body1">{proposal.preExistingConditions || 'None reported'}</Typography>
              </Paper>
            </Box>
          </Paper>

          {/* Timeline */}
          <Paper elevation={2} className={styles.sectionPaper}>
            <Box className={styles.sectionHeader}>
              <CalendarToday color="primary" />
              <Typography variant="h6" color="primary">Timeline</Typography>
            </Box>
            <Box className={styles.timelineContainer}>
              <Box className={styles.timelineItem}>
                <Typography className={styles.caption}>APPLIED DATE</Typography>
                <Typography className={styles.valueText}>{new Date(proposal.appliedDate).toLocaleDateString('en-IN')}</Typography>
              </Box>
              {proposal.reviewedDate && (
                <Box className={styles.timelineItem}>
                  <Typography className={styles.caption}>REVIEWED DATE</Typography>
                  <Typography className={styles.valueText}>{new Date(proposal.reviewedDate).toLocaleDateString('en-IN')}</Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {proposal.underwritingNotes && (
            <Paper elevation={2} className={`${styles.sectionPaper} ${styles.notesSection}`}>
              <Typography variant="h6" className={styles.notesTitle}>Underwriting Notes</Typography>
              <Typography variant="body1">{proposal.underwritingNotes}</Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} variant="contained" size="large">Close</Button>
      </DialogActions>
    </Dialog>
  );
}