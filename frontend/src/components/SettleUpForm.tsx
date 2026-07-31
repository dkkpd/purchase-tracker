import { useState } from "react";
import { recordSettlement } from "../lib/api";
import {getErrorMessage} from "../lib/errors.ts";

interface SettleUpFormProps {
    networkId: number;
    members: { id: number; name: string }[];
    onSettled: () => void;
}

function SettleUpForm({ networkId, members, onSettled }: SettleUpFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [paidTo, setPaidTo] = useState<number>(members[0]?.id ?? 0);
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    function resetForm() {
        setAmount(0);
        setNote("");
        setError(null);
    }

    function handleCancel() {
        resetForm();
        setIsOpen(false);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        try {
            await recordSettlement(networkId, {
                paidTo,
                amount,
                note: note || undefined,
            });
            resetForm();
            setIsOpen(false);
            onSettled();
        } catch (error) {
            setError(getErrorMessage(error, "Something went wrong. Please try again."));
        }
    }

    if (!isOpen) {
        return (
            <button type="button" className="pt-btn-add" onClick={() => setIsOpen(true)}>
                + Settle Up
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="pt-card pt-stack">
            <h3>Settle Up</h3>

            <div className="pt-field">
                <label htmlFor="settle-paid-to" className="pt-label">Paid to</label>
                <select
                    id="settle-paid-to"
                    value={paidTo}
                    onChange={(e) => setPaidTo(Number(e.target.value))}
                    className="pt-input"
                >
                    {members.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pt-field">
                <label htmlFor="settle-amount" className="pt-label">Amount</label>
                <input
                    id="settle-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount === 0 ? "" : amount}
                    onChange={(e) => setAmount(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                    className="pt-input"
                />
            </div>

            <div className="pt-field">
                <label htmlFor="settle-note" className="pt-label">Note (optional)</label>
                <input
                    id="settle-note"
                    type="text"
                    placeholder="e.g. Cash, Venmo"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="pt-input"
                />
            </div>

            <div className="pt-row">
                <button type="button" className="pt-btn pt-btn-secondary" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="pt-btn pt-btn-primary">Record Payment</button>
            </div>

            {error && <p className="pt-banner pt-banner-error">{error}</p>}
        </form>
    );
}

export default SettleUpForm;