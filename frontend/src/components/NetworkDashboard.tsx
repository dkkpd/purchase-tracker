import { useState, useEffect } from "react";
import { createNetwork, joinNetwork, getMyNetworks } from "../lib/api";
import type { NetworkResponse } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { ChevronRightIcon, CopyIcon, CheckIcon } from "./icons";
import styles from "./NetworkDashboard.module.css";

interface NetworkDashboardProps {
    onSelectNetwork: (networkId: number) => void;
}

function NetworkDashboard({onSelectNetwork}: NetworkDashboardProps) {

const [networks, setNetworks] = useState<NetworkResponse[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [newNetworkName, setNewNetworkName] = useState("");
const [inviteCodeInput, setInviteCodeInput] = useState("");
const [copiedId, setCopiedId] = useState<number | null>(null);

async function loadNetworks() {
    try {
        const data = await getMyNetworks();
        setNetworks(data);
    } catch (error){
        console.error("Failed to load networks:", error);
        setError("Could not load your networks.");
    } finally {
        setLoading(false);
    }
}

useEffect (() => {loadNetworks();}, [])

async function handleCreate(event: React.SubmitEvent) {

    event.preventDefault();
    setError(null);

    try {
        await createNetwork({name: newNetworkName});
        setNewNetworkName("");
        await loadNetworks();
    } catch (error) {
        console.error("Failed to create network:", error);
        handleApiError(error);
    }
}

async function handleJoin(event: React.SubmitEvent) {
    
    event.preventDefault();
    setError(null);

    try {
        await joinNetwork({inviteCode: inviteCodeInput})
        setInviteCodeInput("");
        await loadNetworks();
    } catch (error) {
        console.error("Failed to join network:", error);
        handleApiError(error);
    }
}

function handleApiError(error: unknown) {
    setError(getErrorMessage(error, "Something went wrong"));
}

function handleCopyInviteCode(event: React.MouseEvent, network: NetworkResponse) {
    event.stopPropagation();
    navigator.clipboard.writeText(network.inviteCode).then(() => {
        setCopiedId(network.id);
        setTimeout(() => setCopiedId((current) => (current === network.id ? null : current)), 1500);
    }).catch((error) => {
        console.error("Failed to copy invite code:", error);
    });
}

if (loading) {
    return <p className="pt-text-muted">Loading your networks...</p>;
}


return (
    <div className="pt-stack">
        <h2>Your Networks</h2>

        {networks.length === 0 ? (
            <p className="pt-text-muted">You're not in any networks yet.</p>
        ) : (
            <ul className="pt-list">
                {networks.map((network) => (
                    <li key={network.id} className={styles.networkItem}>
                        <button className={styles.networkNameBtn} onClick={() => onSelectNetwork(network.id)}>
                            <span>{network.name}</span>
                            <ChevronRightIcon className={styles.chevron} />
                        </button>
                        <div className={styles.inviteCodeGroup}>
                            <span className={styles.inviteCode}>invite code: <strong>{network.inviteCode}</strong></span>
                            <button
                                type="button"
                                className={`pt-icon-btn ${copiedId === network.id ? "pt-icon-btn-success" : ""}`}
                                onClick={(e) => handleCopyInviteCode(e, network)}
                                title="Copy invite code"
                                aria-label="Copy invite code"
                            >
                                {copiedId === network.id ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        )}

        {error && <p className="pt-banner pt-banner-error">{error}</p>}

        <div className={styles.formsGrid}>
            <form onSubmit={handleCreate} className="pt-card pt-stack">
                <h3>Create a Network</h3>
                <input
                    type = "text"
                    placeholder="Network Name"
                    value = {newNetworkName}
                    onChange={(e) => setNewNetworkName(e.target.value)}
                    className="pt-input"
                />
                <button type="submit" className="pt-btn pt-btn-primary">Create Network</button>
            </form>

            <form onSubmit={handleJoin} className="pt-card pt-stack">
                <h3>Join a Network</h3>
                <input
                    type = "text"
                    placeholder="Invite Code"
                    value = {inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    className="pt-input"
                />
                <button type="submit" className="pt-btn pt-btn-primary">Join Network</button>
            </form>
        </div>
    </div>
);
}

export default NetworkDashboard;