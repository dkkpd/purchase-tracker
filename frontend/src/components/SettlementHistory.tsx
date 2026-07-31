import { useState, useEffect } from "react";
import { getSettlements } from "../lib/api";
import type { SettlementResponse } from "../lib/api";
import styles from "./SettlementHistory.module.css";

interface SettlementHistoryProps {
    networkId: number;
    members: { id: number; name: string }[];
    refreshKey: number;
}

function SettlementHistory({ networkId, members, refreshKey }: SettlementHistoryProps) {
    const [settlements, setSettlements] = useState<SettlementResponse[]>([]);

    function nameFor(userId: number): string {
        return members.find((m) => m.id === userId)?.name ?? `User #${userId}`;
    }

    function formatSettledAt(iso: string): string {
        const date = new Date(iso);
        const day = date.toLocaleDateString();
        const time = date.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return `${day} at ${time}`;
    }

    useEffect(() => {
        getSettlements(networkId).then(setSettlements);
    }, [networkId, refreshKey]);

    if (settlements.length === 0) {
        return (
            <div className="pt-stack-sm">
                <h3>Payment History</h3>
                <p className="pt-text-muted">No payments recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="pt-stack-sm">
            <h3>Payment History</h3>
            <ul className="pt-list">
                {settlements.map((s) => (
                    <li key={s.id} className={styles.settlementRow}>
                        <span>
                            {nameFor(s.paidById)} paid {nameFor(s.paidToId)} ${s.amount.toFixed(2)}
                            {s.note ? ` - "${s.note}"` : ""}
                        </span>
                        <span className={styles.settlementTime}>{formatSettledAt(s.settledAt)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SettlementHistory;