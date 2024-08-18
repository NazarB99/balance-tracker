"use client"

import { deleteTransaction } from "@/app/actions/deleteTransaction";
import { formatBalance } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";
import { toast } from "react-toastify";

export const TransactionItem = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const sign = transaction.amount < 0 ? "-" : "+";

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Are you sure to delete this transaction?"
    );

    if (!confirmed) return null;

    const { message, error } = await deleteTransaction(transactionId);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(message);
  };

  return (
    <li className={transaction.amount > 0 ? "plus" : "minus"}>
      {transaction.text}
      <span>
        {sign}${formatBalance(Math.abs(transaction.amount))}
      </span>
      <button
        className="delete-btn"
        onClick={() => handleDeleteTransaction(transaction.id)}
      >
        x
      </button>
    </li>
  );
};
