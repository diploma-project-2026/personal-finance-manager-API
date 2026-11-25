import type { Transaction, Category } from "../models";
import { money } from "../models";
import { Empty } from "./ui";
export function TransactionTable({
  rows,
  categories,
  onEdit,
  onDelete,
}: {
  rows: Transaction[];
  categories: Category[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}) {
  if (!rows.length) return <Empty text="No transactions found." />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            {onEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.merchant}</td>
              <td>
                {categories.find((c) => c.id === t.categoryId)?.name ||
                  "Uncategorized"}
              </td>
              <td className={t.type === "income" ? "positive" : ""}>
                {t.type === "income" ? "+" : "−"}
                {money(t.amount)}
              </td>
              {onEdit && (
                <td>
                  <div className="actions">
                    <button onClick={() => onEdit(t)}>Edit</button>
                    <button className="danger" onClick={() => onDelete?.(t)}>
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
