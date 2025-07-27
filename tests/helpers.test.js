const { getNextDate, createNotificationForEntry } = require('../utils/helpers');
const { addDays, addWeeks, addMonths, addYears } = require('date-fns');

const mockSave = jest.fn();
const MockNotification = jest.fn(() => ({
  save: mockSave,
}));

jest.mock('../models/Notification', () => MockNotification);

describe('getNextDate', () => {
  const baseDate = new Date('2023-01-01');

  it('returns next day for Daily', () => {
    expect(getNextDate(baseDate, 'Daily')).toEqual(addDays(baseDate, 1));
  });

  it('returns next week for Weekly', () => {
    expect(getNextDate(baseDate, 'Weekly')).toEqual(addWeeks(baseDate, 1));
  });

  it('returns next month for Monthly', () => {
    expect(getNextDate(baseDate, 'Monthly')).toEqual(addMonths(baseDate, 1));
  });

  it('returns next year for Annually', () => {
    expect(getNextDate(baseDate, 'Annually')).toEqual(addYears(baseDate, 1));
  });

  it('throws error for invalid frequency', () => {
    expect(() => getNextDate(baseDate, 'Hourly')).toThrow('Invalid recurrence frequency');
  });
});

describe('createNotificationForEntry', () => {
  it('creates a notification with correct message and calls save()', async () => {
    const entry = {
      type: 'income',
      amount: 100,
      category: 'salary',
      userId: 'user123',
      entryDate: new Date('2023-01-01'),
    };

    await createNotificationForEntry(entry);

    expect(MockNotification).toHaveBeenCalledWith({
      message: 'Income of $100 in salary on Sun Jan 01 2023',
      userId: 'user123',
    });

    expect(mockSave).toHaveBeenCalled();
  });
});
