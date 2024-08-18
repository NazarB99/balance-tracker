import { getUserBalance } from '../getUserBalance';
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

describe('getUserBalance', () => {
  it('should return an error if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });

    const result = await getUserBalance();

    expect(result).toEqual({ error: '' });
    expect(db.transaction.findMany).not.toHaveBeenCalled();
  });

  it('should return zero balance if no transactions are found', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getUserBalance();

    expect(result).toEqual({ balance: 0 });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });

  it('should calculate balance correctly', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockResolvedValue([
      { amount: 100 },
      { amount: -50 },
      { amount: 200 },
      { amount: -150 },
    ]);

    const result = await getUserBalance();

    expect(result).toEqual({ balance: 100 });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });

  it('should return a database error if findMany fails', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await getUserBalance();

    expect(result).toEqual({ error: 'Database error' });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
  });
});