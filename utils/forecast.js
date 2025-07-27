function getLastNMonthsData(transactions, n, category) {
    const now = new Date();
    const results = [];
  
    for (let i = 0; i < n; i++) {
      const month = now.getMonth() - i;
      const year = now.getFullYear() - (month < 0 ? 1 : 0);
      const m = (month + 12) % 12;
  
      const monthlyTotal = transactions
        .filter(txn => {
          const txnDate = new Date(txn.date);
          return txn.category === category &&
                 txnDate.getMonth() === m &&
                 txnDate.getFullYear() === year;
        })
        .reduce((sum, txn) => sum + txn.amount, 0);
  
      results.push(monthlyTotal);
    }
  
    return results;
  }
  
function forecastNextMonth(transactions, category) {
    const last3 = getLastNMonthsData(transactions, 3, category);
    const avg = last3.reduce((a, b) => a + b, 0) / (last3.length || 1);
    return Math.round(avg);
  }

module.exports = { forecastNextMonth, getLastNMonthsData };
  