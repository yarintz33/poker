import React, { useState } from 'react';
import Modal from './Modal';
import styles from '../css/TransferModal.module.css';
import api from '../services/api';

function TransferModal({ isOpen, onClose, onTransferSuccess }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('users/transactions/', {
        amount: Number(amount),
        email: recipient
      });

      if (response.status === 200) {
        onTransferSuccess();
        onClose();
        setAmount('');
        setRecipient('');
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.transferModal}>
        <h2>Transfer Money</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="recipient">Recipient Email:</label>
            <input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              placeholder="Enter recipient's email"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="amount">Amount ($):</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>
          <div className={styles.buttons}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default TransferModal; 