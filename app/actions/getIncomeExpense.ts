"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getIncomeExpense(): Promise<{
  income?: number;
  expense?: number;
  error?: string;
}> {
  const { userId } = auth();

  if (!userId) {
    return { error: "User not found!" };
  }

  try {
    const transactions = await db.transaction.findMany({
      where: { userId },
    });

    const amounts = transactions.map(transaction => transaction.amount);

    const income = amounts.filter(inc => inc > 0).reduce((sum, item) => sum + item, 0);
    const expense = amounts.filter(inc => inc < 0).reduce((sum, item) => sum + item, 0);

    return { income, expense: Math.abs(expense) };
  } catch (error) {
    return {
      error: "Database error",
    };
  }
}
