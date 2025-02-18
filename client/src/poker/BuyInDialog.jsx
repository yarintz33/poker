import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Slider,
  Typography,
  Box
} from '@mui/material';

const BuyInDialog = ({ open, onClose, onConfirm, maxBuyIn = 1000, minBuyIn = 100 }) => {
  const [buyInAmount, setBuyInAmount] = useState(minBuyIn);
  const [nickname, setNickname] = useState('');

  const handleSliderChange = (event, newValue) => {
    setBuyInAmount(newValue);
  };

  const handleInputChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minBuyIn && value <= maxBuyIn) {
      setBuyInAmount(value);
    }
  };

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleConfirm = () => {
    onConfirm(buyInAmount, nickname || 'Anonymous');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Join Table</DialogTitle>
      <DialogContent>
        <Box sx={{ width: 300, mt: 2 }}>
          <TextField
            sx={{ mb: 3 }}
            label="Nickname"
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="Anonymous"
            fullWidth
          />
          <Typography gutterBottom>
            Buy-in Amount: ${buyInAmount}
          </Typography>
          <Slider
            value={buyInAmount}
            onChange={handleSliderChange}
            min={minBuyIn}
            max={maxBuyIn}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `$${value}`}
          />
          <TextField
            sx={{ mt: 2 }}
            label="Buy-in amount"
            type="number"
            value={buyInAmount}
            onChange={handleInputChange}
            fullWidth
            InputProps={{
              inputProps: { 
                min: minBuyIn, 
                max: maxBuyIn 
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Seat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyInDialog; 