import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../services/api";
import {
  useFinance,
  useAppDispatch,
  reportError,
  mutate,
  load,
} from "../store";
import type { Receipt } from "../models";
import { Card, Loading } from "./ui";
import { TransactionForm } from "./TransactionForm";
export function ReceiptFlow({ initial }: { initial?: Receipt }) {
  const [receipt, setReceipt] = useState<Receipt | null>(initial || null),
    [busy, setBusy] = useState(false),
    [simulateFailure, setSimulateFailure] = useState(false);
  const { data, pending } = useFinance(),
    dispatch = useAppDispatch(),
    navigate = useNavigate();
  useEffect(() => {
    if (
      !receipt ||
      !["PROCESSING", "UPLOADED", "PENDING_UPLOAD"].includes(receipt.status)
    )
      return;
    const timer = setInterval(() => {
      request<Receipt>(`receipts/${receipt.id}`)
        .then((next) => {
          setReceipt(next);
          if (next.status === "DONE" || next.status === "FAILED")
            void dispatch(load());
        })
        .catch((e) => {
          clearInterval(timer);
          dispatch(reportError(e.message));
        });
    }, 700);
    return () => clearInterval(timer);
  }, [receipt?.id, receipt?.status, dispatch]);
  async function upload(file: File | undefined) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      dispatch(reportError("Choose a JPG, PNG or WebP image under 8 MB."));
      return;
    }
    setBusy(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setReceipt(
        await request<Receipt>("receipts", "POST", {
          fileName: file.name,
          image,
          simulateFailure,
        }),
      );
      await dispatch(load());
    } catch (e) {
      dispatch(reportError(e instanceof Error ? e.message : "Upload failed"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="notice">
        Demo mode: recognition returns sample data, not actual OCR. Review and
        correct all fields before saving.
      </p>
      <Card title="1. Upload receipt">
        <label className="upload">
          <strong>Choose a receipt image</strong>
          <span>JPG, PNG or WebP · up to 8 MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </label>
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
          />{" "}
          Simulate processing failure (review only)
        </label>
        {busy && <Loading />}
        {receipt && (
          <div className="receipt-preview">
            <img src={receipt.image} alt="Uploaded receipt" />
            <div>
              <p>{receipt.fileName}</p>
              <p className="status">Status: {receipt.status}</p>
              {receipt.status === "PROCESSING" && <Loading />}
              {receipt.status === "FAILED" && (
                <p role="alert">
                  Recognition failed. Upload again or use manual entry.
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
      {receipt?.transactionId && (
        <p className="notice">
          This receipt has already been saved as a transaction.
        </p>
      )}
      {receipt?.status === "DONE" && !receipt.transactionId && data && (
        <>
          <h2>2. Review and edit information</h2>
          <TransactionForm
            key={receipt.id}
            categories={data.categories}
            initial={{
              merchant: receipt.merchant,
              date: receipt.date,
              amount: receipt.amount,
              categoryId: receipt.categoryId,
              type: "expense",
              items: receipt.items,
            }}
            busy={pending > 0 || busy}
            onSave={async (body) => {
              setBusy(true);
              try {
                await dispatch(
                  mutate({
                    path: `receipts/${receipt.id}/confirm`,
                    method: "POST",
                    body: { ...body, type: "expense" },
                  }),
                ).unwrap();
                navigate("/transactions");
              } catch (e) {
                dispatch(
                  reportError(
                    e instanceof Error ? e.message : "Could not save receipt",
                  ),
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      )}
    </>
  );
}
