-- BASELINE MIGRATION -- describes tables that ALREADY EXIST in the live
-- database as of the db pull introspection. This file is never meant to be
-- executed against the real DB -- it is only marked "applied" via
-- `prisma migrate resolve --applied 0_baseline` so Prisma's migration
-- history matches reality. Do not run this file's SQL manually.

-- (Matches: User, RefreshToken, EmailVerification, PasswordReset, Dataset, DataRecord
--  as they already exist live -- included here only for historical record.)
