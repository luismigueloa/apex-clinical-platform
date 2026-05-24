-- Core tables
CREATE TABLE facilities (id SERIAL PRIMARY KEY, name TEXT, pcc_org_id TEXT, pcc_facility_id TEXT, address TEXT, star_rating INT, survey_readiness_score INT, last_updated TIMESTAMP);
CREATE TABLE residents (id SERIAL PRIMARY KEY, facility_id INT, pcc_resident_id TEXT, name TEXT, room TEXT, dob DATE, admission_date DATE, payer_source TEXT, primary_dx TEXT, last_updated TIMESTAMP);
CREATE TABLE risk_scores (id SERIAL PRIMARY KEY, resident_id INT, facility_id INT, score INT, risk_band TEXT, domain_scores JSONB, triggered_alerts JSONB, calculated_at TIMESTAMP);
CREATE TABLE vitals (id SERIAL PRIMARY KEY, resident_id INT, bp_systolic INT, bp_diastolic INT, hr INT, temp NUMERIC, o2_sat INT, weight NUMERIC, recorded_at TIMESTAMP);
CREATE TABLE medications (id SERIAL PRIMARY KEY, resident_id INT, name TEXT, dose TEXT, frequency TEXT, high_risk_flag BOOLEAN, started_at TIMESTAMP);
CREATE TABLE incidents (id SERIAL PRIMARY KEY, resident_id INT, facility_id INT, type TEXT, severity TEXT, description TEXT, occurred_at TIMESTAMP);
CREATE TABLE quality_measures (id SERIAL PRIMARY KEY, facility_id INT, measure_name TEXT, value NUMERIC, national_avg NUMERIC, state_avg NUMERIC, period_start DATE, period_end DATE);
CREATE TABLE morning_briefs (id SERIAL PRIMARY KEY, facility_id INT, pdf_url TEXT, drive_url TEXT, generated_at TIMESTAMP, resident_count INT, critical_count INT, high_count INT);
CREATE TABLE letters_of_authorization (id SERIAL PRIMARY KEY, facility_id INT, signed_by TEXT, signed_at TIMESTAMP, pcc_enabled BOOLEAN);
