import { useState, useEffect } from "react";
import { getSettlements } from "../lib/api";
import type { SettlementResponse } from "../lib/api";
import { ChevronDownIcon } from "./icons";
import styles from "./SettlementHistory.module.css";

const PREVIEW_COUNT = 2;
const PAGE_SIZE = 5;

interface SettlementHistoryProps {
    networkId: number;
    members: { id: number; name: string }[];
    refreshKey: number;
}

function SettlementHistory({ networkId, members, refreshKey }: SettlementHistoryProps) {
    const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);

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

    useEffect(() => {
        setPage(1);
    }, [networkId, refreshKey, expanded]);

    if (settlements.length === 0) {
        return (
            <div className="pt-stack-sm">
                <h3>Payment History</h3>
                <p className="pt-text-muted">No payments recorded yet.</p>
            </div>
        );
    }

    // Newest first, without mutating the state array returned by getSettlements.
    const sorted = [...settlements].sort(
        (a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
    );
    const hasMore = sorted.length > PREVIEW_COUNT;
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const visible = expanded
        ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : sorted.slice(0, PREVIEW_COUNT);
    const showPagination = expanded && totalPages > 1;

    function renderSettlementRow(s: SettlementResponse) {
        const payer = nameFor(s.paidById);
        const payee = nameFor(s.paidToId);
        const hasNote = Boolean(s.note);

        return (
            <li key={s.id} className={hasNote ? styles.settlementRowWithNote : styles.settlementRow}>
                <span className={styles.avatar} aria-hidden="true">{payer.charAt(0).toUpperCase()}</span>
                <div className={hasNote ? styles.settlementMainWithNote : styles.settlementMain}>
                    <div className={styles.settlementLine}>
                        <span className={styles.settlementParties}>
                            <strong>{payer}</strong> <span className="pt-text-muted">paid</span> <strong>{payee}</strong>
                        </span>
                        {hasNote ? (
                            <span className="pt-badge-success">${s.amount.toFixed(2)}</span>
                        ) : (
                            <div className={styles.settlementAside}>
                                <span className="pt-badge-success">${s.amount.toFixed(2)}</span>
                                <span className={styles.settlementTime}>{formatSettledAt(s.settledAt)}</span>
                            </div>
                        )}
                    </div>
                    {hasNote && (
                        <div className={styles.settlementMeta}>
                            <span className={styles.settlementNote}>&ldquo;{s.note}&rdquo;</span>
                            <span className={styles.settlementTime}>{formatSettledAt(s.settledAt)}</span>
                        </div>
                    )}
                </div>
            </li>
        );
    }

    return (
        <div className="pt-stack-sm">
            <h3>Payment History</h3>
            <ul className="pt-list">
                {visible.map(renderSettlementRow)}
            </ul>
            {showPagination && (
                <div className={styles.pagination}>
                    <button
                        type="button"
                        className={styles.pageBtn}
                        onClick={() => setPage((current) => current - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button
                        type="button"
                        className={styles.pageBtn}
                        onClick={() => setPage((current) => current + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
            {hasMore && (
                <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setExpanded((current) => !current)}
                >
                    {expanded ? "Show less" : `Show all ${sorted.length} payments`}
                    <ChevronDownIcon className={expanded ? styles.toggleIconExpanded : styles.toggleIcon} />
                </button>
            )}
        </div>
    );
}

export default SettlementHistory;