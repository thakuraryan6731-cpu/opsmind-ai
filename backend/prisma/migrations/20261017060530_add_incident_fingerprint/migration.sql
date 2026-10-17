
-- Add the column as nullable so existing rows remain valid.
ALTER TABLE "Incident"
ADD COLUMN "fingerprint" TEXT;

-- Assign the payment incident its fingerprint.
UPDATE "Incident"
SET "fingerprint" = 'payment-failure-spike'
WHERE "title" = 'Payment Failure Spike';

-- Give any other existing incidents their own fingerprints.
UPDATE "Incident"
SET "fingerprint" = 'legacy-incident-' || "id"
WHERE "fingerprint" IS NULL;

-- Make the field required after every row has a value.
ALTER TABLE "Incident"
ALTER COLUMN "fingerprint" SET NOT NULL;

-- Add the lookup index.
CREATE INDEX "Incident_organizationId_fingerprint_idx"
ON "Incident"("organizationId", "fingerprint");
