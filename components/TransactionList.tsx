import { getTransactions } from "@/app/actions/getTransactions";
import { TransactionItem } from "./TransactionItem";

export const TransactionList = async () => {
  const { transactions, error } = await getTransactions();

  if (error) {
    <p className="error">{error}</p>;
  }

  return (
    <>
      <h3>History</h3>
      <ul className="list">
        {transactions &&
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
      </ul>
    </>
  );
};
