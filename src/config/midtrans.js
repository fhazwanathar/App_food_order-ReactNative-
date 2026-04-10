// src/config/midtrans.js

export const MIDTRANS_CONFIG = {
  MERCHANT_ID: process.env.EXPO_PUBLIC_MIDTRANS_MERCHANT_ID,
  CLIENT_KEY:  process.env.EXPO_PUBLIC_MIDTRANS_CLIENT_KEY,
  SERVER_KEY:  process.env.EXPO_PUBLIC_MIDTRANS_SERVER_KEY,
  
  // URL untuk Sandbox (Ganti jika sudah Live)
  BASE_URL: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  
  // URL Redirect (Pastikan sudah di-set di Dashboard Midtrans -> Settings -> Configuration)
  FINISH_URL: 'https://foods-streets.vercel.app/payment-finish',
  UNFINISH_URL: 'https://foods-streets.vercel.app/payment-unfinish',
  ERROR_URL: 'https://foods-streets.vercel.app/payment-error',
};
