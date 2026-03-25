-- 1. Create database
CREATE DATABASE business_app;

-- 2. Connect to the database
\c business_app

-- 3. Create table for your form
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    company_type VARCHAR(50) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    registration_country VARCHAR(100) NOT NULL,
    activity TEXT NOT NULL,
    document VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);