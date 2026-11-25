import { money } from "../models";
import { Progress } from "./ui";
export function BudgetRow({
  name,
  spent,
  limit,
}: {
  name: string;
  spent: number;
  limit: number;
}) {
  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  return (
    <div className="budget-row">
      <div className="spread">
        <strong>{name}</strong>
        <span>
          {money(spent)} / {money(limit)}
        </span>
      </div>
      <Progress value={percent} />
      <div className="spread muted">
        <span>{money(limit - spent)} remaining</span>
        <span className={percent > 100 ? "danger-text" : ""}>
          {percent}% ·{" "}
          {percent > 100
            ? "Over budget"
            : percent >= 80
              ? "Near limit"
              : "On track"}
        </span>
      </div>
    </div>
  );
}
