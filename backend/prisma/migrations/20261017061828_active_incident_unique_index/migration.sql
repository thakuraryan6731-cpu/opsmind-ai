
CREATE UNIQUE INDEX "Incident_one_active_payment_failure_per_org"
ON "Incident" ("organizationId", "fingerprint")
WHERE "fingerprint" = 'payment-failure-spike'
  AND "status" IN ('OPEN', 'INVESTIGATING');
