import React, { useState } from 'react';
import styles from '../css/TransactionList.module.css';
import PropTypes from 'prop-types';

function TransactionList({ transactions }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const userMail = localStorage.getItem('email');

  const handleClick = (transactionId) => {
    setExpandedIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(transactionId)) {
        newIds.delete(transactionId);
      } else {
        newIds.add(transactionId);
      }
      return newIds;
    });
  };

  return (
    <div className={styles.transactionList}>
      <div className={styles.header}>
        <h2>Transactions:</h2>
      </div>
      
      <div className={styles.transactionsContainer}>
        {transactions.map(transaction => (
          <div 
            key={transaction._id} 
            className={`${styles.transaction} ${expandedIds.has(transaction._id) ? styles.expanded : ''}`}
            onClick={() => handleClick(transaction._id)}
          >
            <div className={styles.transactionInfo}>
              <div className={styles.transactionBasic}>
              <div className={styles.transactionDetails}>
                  <div className={styles.detailRow}>
                    {transaction.from === userMail ? (
                      <span className={styles.value}>{transaction.to}</span>
                    ) : (
                      <span className={styles.value}>{transaction.from}</span>
                    )}
                  </div>
                </div>
                <div 
                  className={`${styles.amount} ${transaction.from === userMail ? styles.negative : styles.positive}`}
                >
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
              
              {/* Details shown only when expanded */}
              {expandedIds.has(transaction._id) && (
                <div className={styles.transactionDate}>
                {transaction.date}
              </div>

                
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TransactionList;