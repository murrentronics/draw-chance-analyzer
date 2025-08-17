-- Fix OTP expiry security warning by setting shorter OTP expiry time
-- Set OTP expiry to 10 minutes (600 seconds) instead of default longer period
UPDATE auth.config 
SET 
  otp_expiry = 600
WHERE 
  parameter = 'otp_expiry';