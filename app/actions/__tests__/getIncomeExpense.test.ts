import { getIncomeExpense } from '../getIncomeExpense';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

describe('getIncomeExpense', () => {
  it('should return an error if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });

    const result = await getIncomeExpense();

    expect(result).toEqual({ error: 'User not found!' });
    expect(db.transaction.findMany).not.toHaveBeenCalled();
  });

  it('should return zero income and expense if no transactions are found', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getIncomeExpense();

    expect(result).toEqual({ income: 0, expense: 0 });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });

  it('should calculate income and expense correctly', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockResolvedValue([
      { amount: 100 },
      { amount: -50 },
      { amount: 200 },
      { amount: -150 },
    ]);

    const result = await getIncomeExpense();

    expect(result).toEqual({ income: 300, expense: 200 });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });

  it('should return a database error if findMany fails', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await getIncomeExpense();

    expect(result).toEqual({ error: 'Database error' });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });
});