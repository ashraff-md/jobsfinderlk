-- Placeholder company created when a recruiter submits a company for review
ALTER TABLE "company_requests" ADD COLUMN "placeholder_company_id" TEXT;

CREATE UNIQUE INDEX "company_requests_placeholder_company_id_key"
  ON "company_requests"("placeholder_company_id");

ALTER TABLE "company_requests"
  ADD CONSTRAINT "company_requests_placeholder_company_id_fkey"
  FOREIGN KEY ("placeholder_company_id") REFERENCES "companies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
