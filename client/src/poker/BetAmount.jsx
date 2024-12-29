

import "../css/Bet.css";
import { Box } from "@mui/material";

const BetAmount = ({ position, amount }) => {
 return <Box
      sx={{
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid gold',
        padding: '1px',
        minWidth: '4.6%', // Ensure a minimum size
      }}
      className={`Bet ${position}`}
    >
      
      {amount}
    </Box>};

export default BetAmount;


