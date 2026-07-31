import { useState } from "react";
import { createPurchase } from "../lib/api";
import type { PurchaseItemRequest} from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import styles from "./AddPurchaseForm.module.css";

function todayIsoDate(): string {
    // Computed from local time (not UTC) so the default doesn't jump a day early/late near midnight.
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface AddPurchaseFormProps {
    networkId: number;
    members: { id: number; name: string }[]
    onPurchaseCreated: () => void
}

function AddPurchaseForm({networkId, members, onPurchaseCreated}: AddPurchaseFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(todayIsoDate());
    const [items, setItems] = useState<PurchaseItemRequest[]>([{
        description: "", cost: 0, recipientId: members[0]?.id ?? 0}, //use the first member's ID as a sensible default, or 0 if there are somehow no members at all.
    ]);
    const [error, setError] = useState<string | null>(null);

    function updateItem(index: number, updated: Partial<PurchaseItemRequest>) {
        //used Partial request so that updating just one part of a purchase doesn't require pasing the other parts too.
        // for example, updating the cost shouldnt require the description and recipientId every time

        // takes the previous state, and iterates through the previous state until it reaches the item we want to update(indicated by 'index') and then uses object merging with spread syntax.
        // {...item, ...updated} means copy all existing properties from 'item', then overwrite or add properties provided in 'updated'
        setItems((prevState) => prevState.map((item, i) => (i === index ? {...item, ...updated} : item)));
    }

    function addItemRow() {
        setItems((prevState) => [
            ...prevState, {description: "", cost: 0, recipientId: members[0]?.id ?? 0} // same as above on line 16
        ]);
    }

    function removeItemRow(index: number) {
        // keep every item in the list except the one at the given index. works similar to python masking a numpy array
        setItems((prevState) => prevState.filter((_, i) => i !== index));
    }

    function resetForm() {
        setDescription("");
        setPurchaseDate(todayIsoDate());
        setItems([{description: "", cost: 0, recipientId: members[0]?.id ?? 0}]);
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
            await createPurchase(networkId, {description, purchaseDate, items});
            resetForm();
            setIsOpen(false);
            onPurchaseCreated();
        } catch (error) {
            setError(getErrorMessage(error, "Something went wrong creating purchase."));
        }
    }

    if (!isOpen) {
        return (
            <button type="button" className="pt-btn-add" onClick={() => setIsOpen(true)}>
                + Log a Purchase
            </button>
        );
    }

    return (
        <form onSubmit = {handleSubmit} className="pt-card pt-stack">

            <h3>Log a Purchase</h3>

            <input
                type = "text"
                placeholder="Description (e.g. Groceries)"
                value = {description}
                onChange={(e) => setDescription(e.target.value)}
                className="pt-input"
            />

            <input
                type = "date"
                value = {purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="pt-input"
            />

            <h4 className={styles.itemsHeader}>Items</h4>
            <div className="pt-stack-sm">
                {items.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                        <input
                            type="text"
                            placeholder="Item description"
                            value = {item.description}
                            onChange = {(e) => updateItem(index, {description: e.target.value})}
                            className="pt-input"
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Cost"
                            value={item.cost}
                            onChange={(e) => updateItem(index, {cost: parseFloat(e.target.value)})}
                            className="pt-input"
                        />
                        <select
                            value={item.recipientId}
                            onChange = {(e) => updateItem(index, {recipientId: Number(e.target.value) })}
                            className="pt-input"
                        >
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                        {items.length > 1 && (
                            <button type ="button" className="pt-btn pt-btn-danger pt-btn-sm" onClick={() => removeItemRow(index)}>Remove</button>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.actionsRow}>
                <button type = "button" className="pt-btn pt-btn-secondary" onClick={() => addItemRow()}>+ Add another item</button>
                <div className={styles.actionsGroup}>
                    <button type = "button" className="pt-btn pt-btn-secondary" onClick={handleCancel}>Cancel</button>
                    <button type = "submit" className="pt-btn pt-btn-primary">Save Purchase</button>
                </div>
            </div>

            {error && <p className="pt-banner pt-banner-error">{error}</p>}

        </form>
    );
}

export default AddPurchaseForm