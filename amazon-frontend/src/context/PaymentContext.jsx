import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Load payment methods from localStorage
  useEffect(() => {
    const savedMethods = localStorage.getItem('amazon_payment_methods');
    if (savedMethods) {
      try {
        setPaymentMethods(JSON.parse(savedMethods));
      } catch (error) {
        console.error('Error parsing payment methods:', error);
      }
    }
  }, []);

  // Save payment methods to localStorage
  useEffect(() => {
    if (paymentMethods.length > 0) {
      localStorage.setItem('amazon_payment_methods', JSON.stringify(paymentMethods));
    }
  }, [paymentMethods]);

  const addPaymentMethod = async (paymentData, userId) => {
    setIsProcessing(true);
    try {
      // Simulate API call for payment method validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPaymentMethod = {
        id: uuidv4(),
        userId,
        type: paymentData.type, // 'card', 'paypal', 'bank'
        cardNumber: paymentData.cardNumber ? `****-****-****-${paymentData.cardNumber.slice(-4)}` : null,
        cardType: paymentData.cardType, // 'visa', 'mastercard', 'amex'
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        cardholderName: paymentData.cardholderName,
        billingAddress: paymentData.billingAddress,
        isDefault: paymentMethods.length === 0, // First method is default
        email: paymentData.email, // For PayPal
        bankName: paymentData.bankName, // For bank transfer
        accountNumber: paymentData.accountNumber ? `****${paymentData.accountNumber.slice(-4)}` : null,
        createdAt: new Date().toISOString()
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      return { success: true, paymentMethod: newPaymentMethod };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const removePaymentMethod = async (methodId, userId) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev => prev.filter(method => 
        !(method.id === methodId && method.userId === userId)
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const setDefaultPaymentMethod = (methodId, userId) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId && method.userId === userId
    })));
  };

  const processPayment = async (paymentData) => {
    setIsProcessing(true);
    setCurrentTransaction({ status: 'processing', ...paymentData });

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Random success/failure for demo (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const transaction = {
          id: uuidv4(),
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          status: 'completed',
          paymentMethod: paymentData.paymentMethod,
          transactionDate: new Date().toISOString(),
          confirmationNumber: `PAY-${Date.now()}`,
          fees: {
            processing: Math.round(paymentData.amount * 0.029), // 2.9% processing fee
            tax: paymentData.tax || 0
          }
        };

        setCurrentTransaction(transaction);
        return { success: true, transaction };
      } else {
        const error = {
          code: 'PAYMENT_DECLINED',
          message: 'Your payment was declined. Please try a different payment method.',
          details: 'Insufficient funds or invalid payment information.'
        };
        
        setCurrentTransaction({ status: 'failed', error });
        return { success: false, error };
      }
    } catch (error) {
      setCurrentTransaction({ status: 'failed', error: error.message });
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const refundPayment = async (transactionId, amount) => {
    setIsProcessing(true);
    try {
      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const refund = {
        id: uuidv4(),
        originalTransactionId: transactionId,
        amount,
        status: 'completed',
        refundDate: new Date().toISOString(),
        confirmationNumber: `REF-${Date.now()}`,
        estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days
      };

      return { success: true, refund };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserPaymentMethods = (userId) => {
    return paymentMethods.filter(method => method.userId === userId);
  };

  const getDefaultPaymentMethod = (userId) => {
    return paymentMethods.find(method => method.userId === userId && method.isDefault);
  };

  const validateCardNumber = (cardNumber) => {
    // Basic Luhn algorithm validation
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const getCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    
    return 'unknown';
  };

  const formatCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    const formatted = cleanNumber.replace(/(.{4})/g, '$1 ');
    return formatted.trim();
  };

  const clearTransaction = () => {
    setCurrentTransaction(null);
  };

  const value = {
    paymentMethods,
    isProcessing,
    currentTransaction,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    processPayment,
    refundPayment,
    getUserPaymentMethods,
    getDefaultPaymentMethod,
    validateCardNumber,
    getCardType,
    formatCardNumber,
    clearTransaction
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;