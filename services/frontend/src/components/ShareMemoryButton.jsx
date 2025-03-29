import { useState } from 'react';
import { Button, Snackbar, IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';

const ShareMemoryButton = ({ memoryId }) => {
  const [open, setOpen] = useState(false);
  
  const handleShare = () => {
    // Generate a share link
    // Verify this ID format matches what's expected in getMemoryById
    const shareUrl = `${window.location.origin}/shared-memory/${memory.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    
    // Show success message
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<ShareIcon />}
        onClick={handleShare}
      >
        Share Memory
      </Button>
      
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Share link copied to clipboard!"
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default ShareMemoryButton;
