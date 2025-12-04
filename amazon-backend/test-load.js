// Simple test script to find the error
console.log('Starting test...');

try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  
  console.log('Loading express...');
  const express = require('express');
  
  console.log('Loading database...');
  const database = require('./src/config/database');
  
  console.log('Loading notification service...');
  const notificationService = require('./src/services/notificationService');
  
  console.log('Loading SMS service...');
  const smsService = require('./src/services/smsService');
  
  console.log('Loading push notification service...');
  const pushNotificationService = require('./src/services/pushNotificationService');
  
  console.log('All services loaded successfully!');
  
} catch (error) {
  console.error('Error loading modules:', error);
  console.error('Stack:', error.stack);
}