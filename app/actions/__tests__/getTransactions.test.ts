import { getTransactions } from '../getTransactions';
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

describe('getTransactions', () => {
  it('should return an error if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });

    const result = await getTransactions();

    expect(result).toEqual({ error: '' });
    expect(db.transaction.findMany).not.toHaveBeenCalled();
  });

  it('should return an empty array if no transactions are found', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getTransactions();

    expect(result).toEqual({ transactions: [] });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return transactions if found', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    const mockTransactions = [
      { id: 1, amount: 100, createdAt: new Date() },
      { id: 2, amount: -50, createdAt: new Date() },
    ];
    (db.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

    const result = await getTransactions();

    expect(result).toEqual({ transactions: mockTransactions });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a database error if findMany fails', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await getTransactions();

    expect(result).toEqual({ error: 'Database error' });
    expect(db.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      orderBy: { createdAt: 'desc' },
    });
  });
});