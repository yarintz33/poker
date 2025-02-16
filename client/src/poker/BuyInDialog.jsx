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

  const handleSliderChange = (event, newValue) => {
    setBuyInAmount(newValue);
  };

  const handleInputChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minBuyIn && value <= maxBuyIn) {
      setBuyInAmount(value);
    }
  };

  const handleConfirm = () => {
    onConfirm(buyInAmount);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Buy In</DialogTitle>
      <DialogContent>
        <Box sx={{ width: 300, mt: 2 }}>
          <Typography gutterBottom>
            Amount: ${buyInAmount}
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