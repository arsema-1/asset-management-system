-- Add 'rejected' to the return_status enum so admin can reject return requests
ALTER TYPE return_status ADD VALUE IF NOT EXISTS 'rejected';
