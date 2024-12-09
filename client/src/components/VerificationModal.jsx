import React, { useState } from 'react';
import Modal from './Modal';
import api from '../services/api';
//import '../css/VerificationModal.css';

function VerificationModal({ 
  isOpen, 
  onClose, 
  //onVerify, 
 // onResend, 
  title = "Email Verification",
  message = "Please enter the verification code sent to your email"
}) {
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await onVerify(code);
//     setCode("");
//   };


  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/registeration/confirmation', JSON.stringify({ code }));

      if (response.ok) {
        // setIsModalOpen(false);
        // setIsSuccessModalOpen(true);
      } else {
        alert('Invalid verification code');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5000/api/1/registeration/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('New verification code has been sent to your email');
      } else {
        alert('Failed to resend verification code');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong while resending the code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="verification-modal">

        <h2 style={{ color: 'black' }}>{title + " change the css.."}</h2>
        <p>{message}</p>
        <form onSubmit={handleCodeSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            maxLength="6"
          />
          <div className="verification-buttons">
            <button type="submit">Verify</button>
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default VerificationModal; 