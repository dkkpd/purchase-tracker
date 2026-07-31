import { useState, useEffect } from "react";
import { getNetworkMembers, getPurchases, deletePurchase, getNetworkBalances, getNetworkById } from "../lib/api";
import type { BalanceResponse, MemberResponse, PurchaseResponse, NetworkResponse } from "../lib/api";
import AddPurchaseForm from "./AddPurchaseForm";
import PurchaseList from "./PurchaseList";
import BalancesViewByNetwork from "./BalancesViewByNetwork";
import SettlementHistory from "./SettlementHistory";
import SettleUpForm from "./SettleUpForm"
import { CopyIcon, CheckIcon } from "./icons";
import styles from "./NetworkDetailsPage.module.css";

interface NetworkDetailsPageProps {
    networkId: number;
    currentUserId: number;
    onBalancesChanged?: () => void;
}

function NetworkDetailPage({ networkId, currentUserId, onBalancesChanged }: NetworkDetailsPageProps) {
    const [network, setNetwork] = useState<NetworkResponse | null>(null);
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
    const [balances, setBalances] = useState<BalanceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [settlementRefreshKey, setSettlementRefreshKey] = useState(0);
    const [copied, setCopied] = useState(false);

    async function loadData() {
        const [networkData, membersData, purchasesData, balancesData] = await Promise.all([
            getNetworkById(networkId),
            getNetworkMembers(networkId),
            getPurchases(networkId),
            getNetworkBalances(networkId),
        ]);
        setNetwork(networkData);
        setMembers(membersData);
        setPurchases(purchasesData);
        setBalances(balancesData);
        setLoading(false);
        await onBalancesChanged?.();
    }

    function handleCopyInviteCode() {
        if (!network) return;
        navigator.clipboard.writeText(network.inviteCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch((error) => {
            console.error("Failed to copy invite code:", error);
        });
    }

    useEffect(() => {
        loadData();
    }, [networkId]);

    async function handleDelete(purchaseId: number) {
        await deletePurchase(networkId, purchaseId);
        await loadData();
    }

    if (loading) {
        return <p className="pt-text-muted">Loading...</p>;
    }

    return (
        <div className={styles.page}>
            {network && (
                <div className={styles.header}>
                    <h2 className={styles.networkName}>{network.name}</h2>
                    <div className={styles.inviteCodeGroup}>
                        <span className={styles.inviteCode}>invite code: <strong>{network.inviteCode}</strong></span>
                        <button
                            type="button"
                            className={`pt-icon-btn ${copied ? "pt-icon-btn-success" : ""}`}
                            onClick={handleCopyInviteCode}
                            title="Copy invite code"
                            aria-label="Copy invite code"
                        >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.zone}>
                <div className={styles.group}>
                    <BalancesViewByNetwork
                        balances={balances}
                        currentUserId={currentUserId}
                        members={members}
                    />
                </div>
            </div>

            <div className={styles.zone}>
                <div className={styles.group}>
                    <PurchaseList
                        purchases={purchases}
                        currentUserId={currentUserId}
                        members={members}
                        onDelete={handleDelete}
                    />
                </div>
                <div className={styles.group}>
                    <AddPurchaseForm
                        networkId={networkId}
                        members={members}
                        onPurchaseCreated={loadData}
                    />
                </div>
            </div>

            <div className={styles.zone}>
                <div className={styles.group}>
                    <SettlementHistory
                        networkId={networkId}
                        members={members}
                        refreshKey={settlementRefreshKey}
                    />
                </div>
                <div className={styles.group}>
                    <SettleUpForm
                        networkId={networkId}
                        members={members}
                        onSettled={() => {
                            setSettlementRefreshKey((k) => k + 1);
                            loadData();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default NetworkDetailPage;
