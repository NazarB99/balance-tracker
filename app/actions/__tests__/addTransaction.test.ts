/**
 * @jest-environment node
 */

import { auth } from '@clerk/nextjs/server';
import { addTransaction } from '../addTransaction';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    transaction: {
      create: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('addTransaction', () => {
  const mockFormData = (text: string, amount: string) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('amount', amount);
    return formData;
  };

  it('should add a transaction', async () => {
    // Mock implementation for auth
    (auth as jest.Mock).mockReturnValue({ userId: 'user123' });

    // Mock implementation for db.transaction.create
    (db.transaction.create as jest.Mock).mockResolvedValue({
      id: 'transaction123',
      text: 'Test transaction',
      amount: 100,
      userId: 'user123',
    });
    
    // Mock implementation for revalidatePath
    (revalidatePath as jest.Mock).mockResolvedValue(undefined);
    
    const formData = mockFormData('Test transaction', '100');
    const result = await addTransaction(formData);
    
    expect(result).toEqual({
      data: {
        id: 'transaction123',
        text: 'Test transaction',
        amount: 100,
        userId: 'user123',
      },
    });
    
    expect(db.transaction.create).toHaveBeenCalledWith({
      data: {
        text: 'Test transaction',
        amount: 100,
        userId: 'user123',
      },
    });
    
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });
});