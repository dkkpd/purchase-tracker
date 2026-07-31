import type { PurchaseResponse } from "../lib/api";
import styles from "./PurchaseList.module.css";

interface PurchaseListProps {
    purchases: PurchaseResponse[];
    currentUserId: number;
    members: { id: number; name: string}[];
    onDelete: (purchaseId: number) => void;
}

function PurchaseList({purchases, currentUserId, members, onDelete}: PurchaseListProps) {
    if (purchases.length === 0) {
        return (
            <div className="pt-stack-sm">
                <h3>Purchases</h3>
                <p className="pt-text-muted">No purchases logged yet.</p>
            </div>
        );
    }

    return (
        <div className="pt-stack-sm">
            <div className={styles.listHeader}>
                <h3>Purchases</h3>
                <span className={styles.count}>· {purchases.length}</span>
            </div>
            <ul className="pt-list">
                {purchases.map((purchase) => (
                    <li key={purchase.id} className={`pt-card ${styles.purchaseCard}`}>
                        <div className={styles.purchaseHeader}>
                            <strong className={styles.purchaseTitle}>{purchase.description}</strong>
                            <span className={styles.purchaseDate}>({purchase.purchaseDate})</span>
                        </div>
                        <ul className={styles.itemList}>
                            {purchase.items.map((item) => (
                                <li key={item.id} className={styles.itemRow}>
                                    {item.description} - ${item.cost.toFixed(2)} - for {
                                    members.find((m) => m.id === item.recipientId)?.name ?? `User #${item.recipientId}`
                                }
                                </li>
                            ))}
                        </ul>
                        {purchase.purchaserId === currentUserId && (
                            <div className={styles.footerRow}>
                                <button className="pt-btn pt-btn-danger pt-btn-sm" onClick={ () => onDelete(purchase.id)}>Delete</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PurchaseList;