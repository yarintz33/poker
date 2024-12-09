import React, { useState, useEffect } from 'react';
import styles from '../css/Home.module.css';
import { useNavigate } from "react-router-dom";
import TransactionList from "./Transactions.jsx";
import api from '../services/api.js';
import LoadingSpinner from './LoadingSpinner';
import TransferModal from './TransferModal';
import background from '../css/LoginRegister.module.css';


function Home() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [balance, setBalance] = useState(0);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/users/user-info');
        const data = response.data;
        const processedTransactions = data.transactions.map(transaction => ({
          ...transaction,
          date: new Date(Date.parse(transaction.createdAt)).toGMTString(),
          expanded: false
        }));
        setTransactions(processedTransactions);
        setFirstName(data.firstName);
        setBalance(data.balance);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.get('/logout');
      navigate('/login');
    } catch (error) {
      window.alert(error);
    }
  };

  const handleTransferSuccess = async () => {
    try {
      const response = await api.get('/users/user-info');
      const data = response.data;
      const processedTransactions = data.transactions.map(transaction => ({
        ...transaction,
        date: new Date(Date.parse(transaction.createdAt)).toGMTString(),
        expanded: false
      }));
      setTransactions(processedTransactions);
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={ styles.container}>
      <div className={styles.centerText}>
        <h1 className={styles.bankTitle}>
          <span className={styles.bank}>MO Bank</span>
        </h1>
      </div>

      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>Hi, {firstName}</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>

      <section className={styles.accountCard}>
        <div className={styles.balance}>
          <span className={styles.amount}>{balance}$</span>
          <span className={styles.label}>Available</span>
        </div>
      </section>

      <section className={styles.actions}>
        <button 
          className={styles.actionButton}
          onClick={() => setIsTransferModalOpen(true)}
        >
          <span className={styles.actionIcon}>↔</span>
          <span>Transfer</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>↓</span>
          <span>Deposit</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>$</span>
          <span>Pay</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>✉</span>
          <span>Message</span>
        </button>
      </section>

      <TransactionList transactions={transactions} />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferSuccess={handleTransferSuccess}
      />
    </div>
  );
}

export default Home;