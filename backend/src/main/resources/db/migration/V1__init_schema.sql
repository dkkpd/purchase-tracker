/*
TODO:
    - In family_networks table, make created_by nullable, ON DELETE SET NULL, so that if the creater deletes their account, the field is set as null
    - In purchases table, in purchaser_id, add ON DELETE RESTRICT so that if the purchaser deletes their account, it restricts them so that we don't have purchases without a purchaser
    - In settlements table, add ON DELETE RESTRICT on both paid_by and paid_to so that we do not have settlements without payers and payees.
*/

-- Users
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY, --USER ID
    name          VARCHAR(255) NOT NULL, --USERNAME
    email         VARCHAR(255) NOT NULL UNIQUE, --USER EMAIL
    password_hash VARCHAR(255) NOT NULL, --HASHED PASSWORD
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Family Networks
CREATE TABLE family_networks (
    id           BIGSERIAL PRIMARY KEY, --NETWORK ID
    name         VARCHAR(255) NOT NULL, --NETWORK NAME
    invite_code  VARCHAR(20) NOT NULL UNIQUE, --INVITE CODE
    created_by   BIGINT NOT NULL REFERENCES users(id), --CREATOR ID
    created_at   TIMESTAMP NOT NULL DEFAULT now()
);

-- Network Members (join table between users and family_networks)
CREATE TABLE network_members (
    id          BIGSERIAL PRIMARY KEY, --MEMBERSHIP ID
    network_id  BIGINT NOT NULL REFERENCES family_networks(id), --NETWORK ID
    user_id     BIGINT NOT NULL REFERENCES users(id), --USER ID
    joined_at   TIMESTAMP NOT NULL DEFAULT now(), --JOIN DATE
    UNIQUE (network_id, user_id) -- makes sure we don't have 2 of the same pairings of network_id and user_id. Basically makes sure we dont have duplicate users within the same network
);

-- Purchases
CREATE TABLE purchases (
    id            BIGSERIAL PRIMARY KEY, --PURCHASE ID
    network_id    BIGINT NOT NULL REFERENCES family_networks(id), --NETWORK ID
    purchaser_id  BIGINT NOT NULL REFERENCES users(id), --PURCHASER ID, user who purchased the items
    description   VARCHAR(255) NOT NULL, --DESCRIPTION
    purchase_date DATE NOT NULL, --PURCHASE DATE
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP
);

-- Purchase Items (line items within a purchase, each tagged to a recipient)
CREATE TABLE purchase_items (
    id            BIGSERIAL PRIMARY KEY, --PURCHASE ITEM ID
    purchase_id   BIGINT NOT NULL REFERENCES purchases(id),
    description   VARCHAR(255) NOT NULL, --DESCRIPTION
    cost          NUMERIC(12,2) NOT NULL, --COST
    recipient_id  BIGINT NOT NULL REFERENCES users(id) --RECIPIENT ID
);

-- Settlements
CREATE TABLE settlements (
    id          BIGSERIAL PRIMARY KEY, --SETTLEMENT ID
    network_id  BIGINT NOT NULL REFERENCES family_networks(id), --NETWORK ID
    paid_by     BIGINT NOT NULL REFERENCES users(id), --PAID BY ID
    paid_to     BIGINT NOT NULL REFERENCES users(id), --PAID TO ID
    amount      NUMERIC(12,2) NOT NULL, --AMOUNT
    note        VARCHAR(255), --NOTE
    settled_at  TIMESTAMP NOT NULL DEFAULT now() --SETTLED AT
);

-- Indexes for the lookups we already know we'll need
CREATE INDEX idx_purchases_network_id ON purchases(network_id);
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_settlements_network_id ON settlements(network_id);