import { deleteTransaction } from '../deleteTransaction';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    transaction: {
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('deleteTransaction', () => {
  it('should return an error if user is not authenticated', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: null });

    const result = await deleteTransaction('transaction123');

    expect(result).toEqual({ error: 'User not authenticated' });
    expect(db.transaction.delete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should delete the transaction and return a success message', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.delete as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteTransaction('transaction123');

    expect(result).toEqual({ message: 'Transaction deleted' });
    expect(db.transaction.delete).toHaveBeenCalledWith({
      where: { id: 'transaction123', userId: 'user123' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('should return a database error if deletion fails', async () => {
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });
    (db.transaction.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await deleteTransaction('transaction123');

    expect(result).toEqual({ error: 'Database error' });
    expect(db.transaction.delete).toHaveBeenCalledWith({
      where: { id: 'transaction123', userId: 'user123' },
    });
    expect(revalidatePath).not.toHaveBeenCalledWith();
  });
});