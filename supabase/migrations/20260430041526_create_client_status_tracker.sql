/*
  # Client Status Tracker

  ## Overview
  Creates the data model for a 10-person firm to track statuses of ~70 clients.

  ## New Tables

  ### clients
  - id (uuid, primary key)
  - row_number (int) - display order
  - name (text) - client name
  - industry (text) - industry category
  - status_color (text) - one of: red, yellow, green, blue, black
  - status_note (text) - free text note about current status
  - updated_by (text) - name of staff member who last updated
  - updated_at (timestamptz) - when last updated
  - created_at (timestamptz)

  ## Security
  - RLS enabled with open read/write for authenticated-style access (internal firm tool)
  - Since this is an internal tool without user auth, we use anon key with permissive policies
    scoped to the anon role for simplicity

  ## Notes
  - status_color values map to: red=urgent/upset, yellow=under control, green=no issues, blue=gone cold, black=lost
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_number integer NOT NULL,
  name text NOT NULL,
  industry text NOT NULL DEFAULT '',
  status_color text NOT NULL DEFAULT 'yellow',
  status_note text NOT NULL DEFAULT '',
  updated_by text NOT NULL DEFAULT '',
  updated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read clients"
  ON clients FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert clients"
  ON clients FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update clients"
  ON clients FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Seed with all 69 clients from the data
INSERT INTO clients (row_number, name, industry, status_color, status_note, updated_by, updated_at) VALUES
(1, 'ABANS', 'Capital Markets', 'yellow', 'Gone live but has issues', '', now()),
(2, 'Aditya Birla Money', 'Capital Markets', 'yellow', 'Account Aggregator - Finarkein issues', '', now()),
(3, 'Aditya Birla Sun Life Asset Management Company', 'Mutual Fund', 'yellow', '', '', now()),
(4, 'Aequitas Investment Consultancy Private Limited', 'Capital Markets', 'black', 'Not responding', '', now()),
(5, 'Alchemy Capital Management Private Limited', 'Capital Markets', 'red', '', '', now()),
(6, 'Arka Fincap', 'NBFC', 'yellow', 'Not in touch for over a month', '', now()),
(7, 'Avendus Capital Pvt Ltd', 'Capital Markets', 'yellow', '', '', now()),
(8, 'Axis Asset Management Co.Ltd', 'Mutual Fund', 'red', 'Hitesh had called me and threatened to withdraw. But the final patch was deployed on 29 April 2026', '', now()),
(9, 'Bajaj Finserv AMC', 'Mutual Fund', 'yellow', '', '', now()),
(10, 'Barclays', 'Foreign Banks', 'yellow', 'Anand Chitale wants an upgrade cost for FX. Subbu said he will call but not responding now.', '', now()),
(11, 'Baroda BNP Paribas Asset Management India Pvt. Ltd.', 'Mutual Fund', 'green', 'AMC agreed and invoice to be raised', '', now()),
(12, 'Canara Robeco', 'Mutual Fund', 'yellow', 'Yet another data update request which has been agreed upon', '', now()),
(13, 'Choice AMC', 'Mutual Fund', 'red', 'Soham/Ishaan met them on 29 April. They are very upset. MOM available', '', now()),
(14, 'CITIBANK', 'Foreign Banks', 'yellow', '', '', now()),
(15, 'CRISIL', 'Rating', 'green', 'On going. No functionality changes but ongoing data issues', '', now()),
(16, 'DAM Capital Advisors', 'Capital Markets', 'green', 'Soham has met and detailed MOM shared. They seem to be happy. Waiting for Natarajan for NOVUS upgrade', '', now()),
(17, 'DBS', 'Foreign Banks', 'yellow', '', '', now()),
(18, 'ENAM', 'Capital Markets', 'yellow', '', '', now()),
(19, 'Franklin Templeton Asset Management (India) Pvt.Ltd.', 'Mutual Fund', 'yellow', '', '', now()),
(20, 'Groww', 'Mutual Fund', 'yellow', '', '', now()),
(21, 'HDFC Asset Management Company Ltd', 'Mutual Fund', 'red', '2 issues with Dinesh and Supriya. We deleted 2 records of Supriya basis Jehan.', '', now()),
(22, 'HDFC ERGO General Insurance Company Limited', 'Insurance', 'yellow', '', '', now()),
(23, 'Helios Capital Management (India) Private Limited', 'Mutual Fund', 'blue', '', '', now()),
(24, 'HSBC Asset Management (India) Pvt Ltd', 'Mutual Fund', 'red', 'VAPT issue', '', now()),
(25, 'ICICI Prudential Asset Management Co. Ltd', 'Mutual Fund', 'yellow', '', '', now()),
(26, 'ICICI Prudential Life Insurance', 'Insurance', 'blue', '', '', now()),
(27, 'ICRA Limited', 'Rating', 'yellow', '', '', now()),
(28, 'IndiaFirst', 'Insurance', 'yellow', '', '', now()),
(29, 'Invesco Mutual Fund', 'Mutual Fund', 'yellow', 'Ongoing. 2 releases given. CR potential. We have to raise the Velox Expense AMC PO', '', now()),
(30, 'ITI Asset Management Limited', 'Mutual Fund', 'blue', '', '', now()),
(31, 'Jio BlackRock AMC', 'Mutual Fund', 'yellow', '', '', now()),
(32, 'JIO Wealth', 'Capital Markets', 'yellow', '', '', now()),
(33, 'JM FINANCIAL ASSET MANAGEMENT LIMITED', 'Mutual Fund', 'yellow', '', '', now()),
(34, 'Kotak International Ltd', 'Capital Markets', 'yellow', 'Prasad issue. We have given the quote for Phase 2', '', now()),
(35, 'Kotak Investment Advisors', 'Capital Markets', 'yellow', '', '', now()),
(36, 'Kotak Life Insurance', 'Insurance', 'red', '', '', now()),
(37, 'Kotak Mahindra Asset Management Company Limited', 'Mutual Fund', 'green', '', '', now()),
(38, 'Kotak Mahindra Bank Limited', 'Bank', 'yellow', '', '', now()),
(39, 'Kotak Mahindra Investments Limited', 'Capital Markets', 'yellow', '', '', now()),
(40, 'Kotak Mahindra Capital Company Limited', 'Capital Markets', 'yellow', 'Arun Mathews - AA issue. Discarding AA and now planning to integrate KSEC', '', now()),
(41, 'L&T Finance Limited', 'NBFC', 'yellow', 'Ongoing issue. No fixes given', '', now()),
(42, 'LIC Mutual Fund Asset Management Limited', 'Mutual Fund', 'red', 'Website - Siddhi and Rudresh in touch, Nothing to be done from our side. All VAPT issues closed. Novus - Stalemate - Compliance team not testing. Velox - VAPT issue escalation', '', now()),
(43, 'Mahindra Manulife Investment Management Private Limited', 'Mutual Fund', 'yellow', '', '', now()),
(44, 'Mirae Asset Capital Markets (India) Pvt. Ltd', 'Capital Markets', 'black', '', '', now()),
(45, 'Mirae Asset Investment Managers (India) Pvt. Ltd.', 'Mutual Fund', 'yellow', '', '', now()),
(46, 'NaBFID', 'Bank', 'yellow', '', '', now()),
(47, 'Navi Technologies Private Limited', 'Mutual Fund', 'yellow', 'Wanted a deletion at back end and we agreed. They have crossed 50 users and want an upgrade', '', now()),
(48, 'Nippon Life India Asset Management Limited', 'Mutual Fund', 'green', 'CSM done in 3rd week of April', '', now()),
(49, 'NJ Asset Management Pvt.Ltd', 'Mutual Fund', 'green', 'CSM done in 3rd week of April', '', now()),
(50, 'PGIM India Asset Management Private Limited.', 'Mutual Fund', 'blue', '', '', now()),
(51, 'PNB MetLife India Insurance Company Limited', 'Insurance', 'yellow', '', '', now()),
(52, 'PPFAS', 'Mutual Fund', 'red', 'Soham had a detailed chat with Priya. We have to rectify and go back with dates', '', now()),
(53, 'Quantum Advisors Private Limited', 'Capital Markets', 'yellow', '', '', now()),
(54, 'Quantum Asset Management Company Private Limited', 'Mutual Fund', 'yellow', '', '', now()),
(55, 'SBI CapitalMarkets Ltd.', 'Capital Markets', 'yellow', 'Release given but no reply.', '', now()),
(56, 'SBI Funds Management Private Ltd', 'Mutual Fund', 'yellow', 'Saurabh spent 2 days there. Data migration issues', '', now()),
(57, 'SBI Life Insurance Co. Ltd', 'Insurance', 'blue', '', '', now()),
(58, 'Spark Capital', 'Capital Markets', 'yellow', '', '', now()),
(59, 'Standard Chartered Capital', 'NBFC', 'green', 'PO received for CR of Rs 6 lakhs', '', now()),
(60, 'Tata Asset Management Limited', 'Mutual Fund', 'yellow', '', '', now()),
(61, 'Trust ASSET MANAGEMENT PRIVATE LIMITED.', 'Mutual Fund', 'yellow', '', '', now()),
(62, 'Trust Investment Advisors Private Limited', 'Capital Markets', 'yellow', '', '', now()),
(63, 'Union Asset Management Company', 'Mutual Fund', 'yellow', 'Bhavika wanted a note, responded on 29 April for payment release.', '', now()),
(64, 'UTI Asset Management Co.Ltd', 'Mutual Fund', 'yellow', '', '', now()),
(65, 'Whiteoak Capital Asset Management Limited', 'Mutual Fund', 'yellow', '', '', now()),
(66, 'Zerodha Asset Management Pvt Ltd', 'Mutual Fund', 'yellow', '', '', now()),
(67, 'NIIF', 'Bank', 'yellow', '', '', now()),
(68, 'Fyers', 'Mutual Fund', 'yellow', '', '', now()),
(69, 'Unity Small Finance Bank', 'Bank', 'red', '', '', now())
ON CONFLICT DO NOTHING;
