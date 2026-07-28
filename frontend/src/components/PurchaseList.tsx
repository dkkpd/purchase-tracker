import type { PurchaseResponse } from "../lib/api";

interface PurchaseListProps {
    purchases: PurchaseResponse[];
    currentUserId: number;
    members: { id: number; name: string}[];
    onDelete: (purchaseId: number) => void;
}

function PurchaseList({purchases, currentUserId, members, onDelete}: PurchaseListProps) {
    if (purchases.length === 0) {
        return <p>No purchases logged yet.</p>;
    }

    return (
        <ul>
            {purchases.map((purchase) => (
                <li key={purchase.id}>
                    <strong>{purchase.description}</strong> ({purchase.purchaseDate})
                    <ul>
                        {purchase.items.map((item) => (
                            <li key={item.id}>
                                {item.description} - ${item.cost.toFixed(2)} - for {
                                members.find((m) => m.id === item.recipientId)?.name ?? `User #${item.recipientId}`
                            }
                            </li>
                        ))}
                    </ul>
                    {purchase.purchaserId === currentUserId && (
                        <button onClick={ () => onDelete(purchase.id)}>Delete</button>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default PurchaseList;