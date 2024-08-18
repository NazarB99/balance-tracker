import { getIncomeExpense } from "../app/actions/getIncomeExpense";
import { formatBalance } from "../lib/utils";

export const IncomeExpense = async () => {
  const { income, expense } = await getIncomeExpense();

  return (
    <div className="inc-exp-container">
      <div>
        <h4>Income</h4>
        <p className="money plus">${formatBalance(income ?? 0)}</p>
      </div>
      <div>
        <h4>Expense</h4>
        <p className="money minus">${formatBalance(expense ?? 0)}</p>
      </div>
    </div>
  );
};
