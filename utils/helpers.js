const { addDays, addWeeks, addMonths, addYears } = require('date-fns');

function getNextDate(date, frequency) {
  switch (frequency) {
    case 'Daily':
      return addDays(date, 1);
    case 'Weekly':
      return addWeeks(date, 1);
    case 'Monthly':
      return addMonths(date, 1);
    case 'Annually':
      return addYears(date, 1);
    default:
      throw new Error('Invalid recurrence frequency');
  }
}

async function createNotificationForEntry(entry) {
  function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const Notification = require('../models/Notification');
  const notification = new Notification({
    message: `${capitaliseFirstLetter(entry.type)} of $${entry.amount} in ${entry.category} on ${entry.entryDate.toDateString()}`,
    userId: entry.userId,
  });
  console.log("Creating notification for entry:", notification);
  await notification.save();
}

module.exports = { getNextDate, createNotificationForEntry };