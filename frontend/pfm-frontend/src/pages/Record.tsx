import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance, useAppDispatch, mutate } from "../store";
import { Heading } from "../components/ui";
import { TransactionForm } from "../components/TransactionForm";
import { ReceiptFlow } from "../components/ReceiptFlow";
export default function Record() {
  const [tab, setTab] = useState("manual"),
    { data, pending } = useFinance(),
    dispatch = useAppDispatch(),
    navigate = useNavigate();
  return (
    <>
      <Heading
        title="Record Expense"
        subtitle="Add a transaction manually or upload a receipt"
      />
      <div className="tabs">
        <button
          aria-pressed={tab === "receipt"}
          onClick={() => setTab("receipt")}
        >
          Upload Receipt
        </button>
        <button
          aria-pressed={tab === "manual"}
          onClick={() => setTab("manual")}
        >
          Manual Entry
        </button>
      </div>
      {tab === "receipt" ? (
        <ReceiptFlow />
      ) : (
        data && (
          <TransactionForm
            categories={data.categories}
            busy={pending > 0}
            onSave={async (body) => {
              try {
                await dispatch(
                  mutate({ path: "transactions", method: "POST", body }),
                ).unwrap();
                navigate("/transactions");
              } catch {
                /* Handled by the global error handler. */
              }
            }}
          />
        )
      )}
    </>
  );
}
