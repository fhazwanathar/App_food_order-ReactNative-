// src/config/midtrans.js

export const MIDTRANS_CONFIG = {
  MERCHANT_ID: 'M583104013',
  CLIENT_KEY:  'Mid-client-Gv9FDQ7k4_1lykVi',
  SERVER_KEY:  'Mid-server-mg5SbqeMBtiW4p4_qgaJl1Rn',
  
  // URL untuk Sandbox (Ganti jika sudah Live)
  BASE_URL: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  
  // URL Redirect (Pastikan sudah di-set di Dashboard Midtrans -> Settings -> Configuration)
  FINISH_URL: 'https://foods-streets.vercel.app/payment-finish',
  UNFINISH_URL: 'https://foods-streets.vercel.app/payment-unfinish',
  ERROR_URL: 'https://foods-streets.vercel.app/payment-error',
};
