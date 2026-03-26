export const processEWalletPayment = async (selectedWallet, amount, orderId) => {
  return new Promise((resolve, reject) => {
    // Simulasi delay API pembayaran (misal 2 detik)
    setTimeout(() => {
      // 90% chance of success untuk simulasi
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        resolve({
          status: 'success',
          transactionId: `TXN-${selectedWallet.toUpperCase()}-${Date.now()}`,
          message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} via ${selectedWallet} berhasil.`
        });
      } else {
        reject({
          status: 'failed',
          message: `Saldo ${selectedWallet} tidak mencukupi atau terjadi kesalahan server.`
        });
      }
    }, 2000);
  });
};
