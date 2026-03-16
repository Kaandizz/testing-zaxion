// Payment Processing Module
// Handles Stripe payment processing and webhooks
// Author: Senior Backend Engineer
// Date: 2024-03-15
// 
// This module integrates with Stripe for:
// - Customer creation
// - Payment processing
// - Subscription management
// - Webhook handling

const stripe = require('stripe');
const crypto = require('crypto');

// VIOLATION 1: Hardcoded Stripe API keys
// TODO: Move these to environment variables before merging
const STRIPE_SECRET_KEY = 'sk_live_51MXqL2SJ3m4hGpYxKL9M8N7O6P5Q4R3S2T1U0V9W8X7Y6Z5A4B3C2D1E0F9G8H7';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51MXqL2SJ3m4hGpYx2X3V4b5N6M7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5';

// VIOLATION 2: Hardcoded webhook secret
// This is used to verify Stripe webhook signatures
const STRIPE_WEBHOOK_SECRET = 'whsec_zaxion_stripe_production_webhook_endpoint_2024';

// Initialize Stripe client
const stripeClient = stripe(STRIPE_SECRET_KEY);

/**
 * Create a new customer in Stripe
 * VIOLATION 3: No input validation on customer data
 */
async function createCustomer(email, name, metadata) {
  try {
    const customer = await stripeClient.customers.create({
      email: email,
      name: name,
      metadata: metadata,
    });
    
    // VIOLATION 4: Logging sensitive customer data
    console.log('Customer created:', customer);
    console.log('Customer email:', email);
    
    return customer;
  } catch (error) {
    // VIOLATION 5: Exposing Stripe error details to logs
    console.error('Stripe error:', error);
    console.error('API Key used:', STRIPE_SECRET_KEY.substring(0, 20) + '...');
    throw error;
  }
}

/**
 * Process a payment
 * VIOLATION 6: No amount validation (could charge $0 or negative)
 * VIOLATION 7: Missing fraud detection checks
 */
async function processPayment(amount, currency, customerId, paymentMethodId) {
  // VIOLATION 8: No try-catch block
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amount,  // Amount in cents
    currency: currency,
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
  });
  
  // VIOLATION 9: Logging payment details (PCI compliance violation)
  console.log('Payment processed:', {
    amount: amount,
    customer: customerId,
    paymentMethod: paymentMethodId,
    status: paymentIntent.status,
  });
  
  return paymentIntent;
}

/**
 * Create a subscription
 * VIOLATION 10: No validation on price_id (could be malicious)
 */
async function createSubscription(customerId, priceId, trialDays) {
  const subscription = await stripeClient.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
  });
  
  return subscription;
}

/**
 * Handle Stripe webhooks
 * VIOLATION 11: Webhook signature verification is commented out
 * VIOLATION 12: This allows attackers to fake webhook events
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const payload = req.body;
  
  let event;
  
  try {
    // VIOLATION: Signature verification is disabled for "testing"
    // event = stripeClient.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
    
    // HACK: Just parse the body directly (DANGEROUS!)
    event = JSON.parse(payload);
    
    console.log('Webhook event received:', event.type);
    
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // VIOLATION 13: Processing payment without verification
      await handlePaymentSuccess(paymentIntent);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionCanceled(subscription);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
}

/**
 * Handle successful payment
 * VIOLATION 14: No database transaction safety
 */
async function handlePaymentSuccess(paymentIntent) {
  const { pool } = require('./database');
  
  // VIOLATION 15: SQL injection vulnerability
  // Using string concatenation instead of parameterized queries
  const query = `
    UPDATE orders 
    SET status = 'paid', 
        payment_intent_id = '${paymentIntent.id}',
        amount_paid = ${paymentIntent.amount}
    WHERE customer_id = '${paymentIntent.customer}'
  `;
  
  await pool.query(query);
  
  // VIOLATION 16: Sending email without rate limiting
  // Could be abused to spam customers
  await sendPaymentConfirmationEmail(paymentIntent.customer);
}

/**
 * Refund a payment
 * VIOLATION 17: No authorization check (anyone can refund!)
 * VIOLATION 18: No audit logging
 */
async function refundPayment(paymentIntentId, amount, reason) {
  const refund = await stripeClient.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount,
    reason: reason,
  });
  
  // VIOLATION 19: No notification to customer
  // VIOLATION 20: No fraud detection (mass refund attack)
  
  return refund;
}

/**
 * Get customer payment methods
 * VIOLATION 21: Exposing full card details in logs
 */
async function getPaymentMethods(customerId) {
  const paymentMethods = await stripeClient.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  
  // VIOLATION 22: Logging full payment method details
  console.log('Payment methods for customer:', customerId);
  paymentMethods.data.forEach(pm => {
    console.log('Card:', pm.card.brand, pm.card.last4, pm.card.exp_month, pm.card.exp_year);
  });
  
  return paymentMethods;
}

/**
 * Update subscription
 * VIOLATION 23: No validation that user owns the subscription
 */
async function updateSubscription(subscriptionId, newPriceId) {
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  
  // VIOLATION 24: Could change someone else's subscription
  const updated = await stripeClient.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
  });
  
  return updated;
}

/**
 * Cancel subscription
 * VIOLATION 25: No confirmation or grace period
 * VIOLATION 26: Immediate cancellation without warning
 */
async function cancelSubscription(subscriptionId) {
  const deleted = await stripeClient.subscriptions.del(subscriptionId);
  
  // VIOLATION 27: No email notification to customer
  // VIOLATION 28: No retention attempt (offer discount, pause, etc.)
  
  return deleted;
}

/**
 * Create a checkout session
 * VIOLATION 29: Success/cancel URLs not validated
 * VIOLATION 30: Could redirect to malicious site
 */
async function createCheckoutSession(priceId, successUrl, cancelUrl) {
  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: successUrl,  // No validation!
    cancel_url: cancelUrl,    // No validation!
  });
  
  return session;
}

/**
 * Helper function to send payment confirmation email
 * VIOLATION 31: Using hardcoded SendGrid API key
 */
async function sendPaymentConfirmationEmail(customerId) {
  const sgMail = require('@sendgrid/mail');
  
  // VIOLATION 32: Hardcoded API key
  const SENDGRID_API_KEY = 'SG.zaxion-production-key.1234567890AbCdEfGhIjKlMnOpQrStUvWxYz-ProdKey';
  sgMail.setApiKey(SENDGRID_API_KEY);
  
  const customer = await stripeClient.customers.retrieve(customerId);
  
  const msg = {
    to: customer.email,
    from: 'noreply@company.com',
    subject: 'Payment Confirmation',
    text: 'Your payment was successful!',
    html: '<p>Your payment was successful!</p>',
  };
  
  // VIOLATION 33: No error handling
  await sgMail.send(msg);
  
  // VIOLATION 34: Logging customer email
  console.log('Confirmation email sent to:', customer.email);
}

/**
 * Debug endpoint to view Stripe configuration
 * VIOLATION 35: Exposing API keys in debug endpoint
 * VIOLATION 36: No authentication required
 */
function getStripeConfig() {
  return {
    apiKey: STRIPE_SECRET_KEY,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    webhookSecret: STRIPE_WEBHOOK_SECRET,
    environment: 'production',
    accountId: 'acct_1234567890',  // VIOLATION 37: Exposing account ID
  };
}

/**
 * Test payment with hardcoded card
 * VIOLATION 38: Test card details in production code
 */
async function testPayment() {
  const testCard = {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
  };
  
  // This shouldn't be in production code
  console.log('Test card:', testCard);
}

// VIOLATION 39: Exporting sensitive configuration
module.exports = {
  createCustomer,
  processPayment,
  createSubscription,
  handleWebhook,
  refundPayment,
  getPaymentMethods,
  updateSubscription,
  cancelSubscription,
  createCheckoutSession,
  getStripeConfig,
  testPayment,
  
  // VIOLATION 40: Exporting API keys
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET,
  SENDGRID_API_KEY: 'SG.zaxion-production-key.1234567890AbCdEfGhIjKlMnOpQrStUvWxYz-ProdKey',
};

// VIOLATION 41: Credentials in comments for "reference"
/*
 * Stripe Dashboard: https://dashboard.stripe.com
 * Login: admin@company.com
 * Password: StripeAdmin123!
 * 
 * Test API Keys (don't use these in production):
 * sk_test_51MXqL2SJ3m4hGpYx_TEST_KEY
 * 
 * Production Backup Key (in case primary fails):
 * sk_live_BACKUP_KEY_51MXqL2SJ3m4hGpYx9K8L7M6N5O4P3Q2R1S0T9U8V7W6X5Y4Z3A2B1C0
 */
