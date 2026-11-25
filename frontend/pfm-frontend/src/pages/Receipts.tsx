import { useState, useEffect } from "react";
import { useFinance, useAppDispatch, load } from "../store";
import { Card, Heading, Empty } from "../components/ui";
import { ReceiptFlow } from "../components/ReceiptFlow";
export default function Receipts() {
  const { data } = useFinance(),
    dispatch = useAppDispatch(),
    [selected, setSelected] = useState("");
  useEffect(() => {
    void dispatch(load());
  }, [dispatch]);
  const receipt = data?.receipts.find((r) => r.id === selected);
  return (
    <>
      <Heading
        title="Receipt Processing"
        subtitle="Upload a receipt and review extracted information before saving"
      />
      <Card title="Receipt history">
        {!data?.receipts.length && <Empty text="No receipts uploaded yet." />}
        {data?.receipts.map((r) => (
          <div className="spread budget-row" key={r.id}>
            <span>
              {r.fileName} · {r.status}
            </span>
            <button onClick={() => setSelected(r.id)}>Review</button>
          </div>
        ))}
        <button onClick={() => setSelected("")}>+ New receipt</button>
      </Card>
      <ReceiptFlow key={selected} initial={receipt} />
    </>
  );
}
