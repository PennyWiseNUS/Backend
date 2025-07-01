const cron = require('node-cron');
const { createNotificationForEntry, startOfDay } = require('date-fns');
const Entry = require('./models/Entry');
const Notification = require('./models/Notification');

// Scheduled task to handle recurring entries
cron.schedule('0 0 * * *', async () => {
  try {
    const todayStart = startOfDay(new Date());
    const entries = await Entry.find({
      isRecurring: true,
      nextReminderDate: todayStart,
    });

    for (const entry of entries) {
      const newEntryDate = entry.nextReminderDate;
      const nextNextDate = startOfDay(getNextDate(newEntryDate, entry.recurrenceFrequency));

      const newEntry = new Entry({
        amount: entry.amount,
        category: entry.category,
        type: entry.type,
        entryDate: newEntryDate,
        notes: entry.notes,
        isRecurring: entry.isRecurring,
        recurrenceFrequency: entry.recurrenceFrequency,
        recurrenceEndDate: entry.recurrenceEndDate,
        userId: entry.userId,
        nextReminderDate: nextNextDate <= entry.recurrenceEndDate ? nextNextDate : null,
      });

      await newEntry.save();
      await createNotificationForEntry(newEntry);
    }
  } catch (error) {
    console.error('Scheduled task error:', error);
  }
}, {
  timezone: 'Asia/Singapore', // Adjust as needed
});