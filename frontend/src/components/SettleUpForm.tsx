import { useState } from "react";
import { recordSettlement } from "../lib/api";
import {getErrorMessage} from "../lib/errors.ts";

interface SettleUpFormProps {
    networkId: number;
    members: { id: number; name: string }[];
    onSettled: () => void;
}

function SettleUpForm({ networkId, members, onSettled }: SettleUpFormProps) {
    const [paidTo, setPaidTo] = useState<number>(members[0]?.id ?? 0);
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        try {
            await recordSettlement(networkId, {
                paidTo,
                amount,
                note: note || undefined,
            });
            setAmount(0);
            setNote("");
            onSettled();
        } catch (error) {
            setError(getErrorMessage(error, "Something went wrong. Please try again."));
        }
    }

    return (
        <form onSubmit={handleSubmit} className="pt-card pt-stack">
            <h3>Settle Up</h3>

            <select value={paidTo} onChange={(e) => setPaidTo(Number(e.target.value))} className="pt-input">
                {members.map((member) => (
                    <option key={member.id} value={member.id}>
                        {member.name}
                    </option>
                ))}
            </select>

            <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="pt-input"
            />

            <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="pt-input"
            />

            <button type="submit" className="pt-btn pt-btn-primary">Record Payment</button>

            {error && <p className="pt-banner pt-banner-error">{error}</p>}
        </form>
    );
}

export default SettleUpForm;