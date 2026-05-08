-- ============================================================================
-- Payroll Management System - Complete SQL Schema for PostgreSQL
-- Nepal-specific with SSF (11% + 20%) and Progressive Tax System
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Payroll Configuration Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- SSF Rates
    ssf_employee_rate DECIMAL(5,2) NOT NULL DEFAULT 11.00,  -- 11%
    ssf_employer_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,  -- 20%
    
    -- System Settings
    minimum_wage DECIMAL(12,2) NOT NULL DEFAULT 13500.00,
    taxation_enabled BOOLEAN DEFAULT true,
    ssf_enabled BOOLEAN DEFAULT true,
    currency_code VARCHAR(3) DEFAULT 'NPR',
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. Tax Slabs Table (Progressive Tax System)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tax_slabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Tax Bracket Definition
    min_income DECIMAL(15,2) NOT NULL,
    max_income DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,  -- 0-100
    relief_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Date Range (for handling tax changes)
    effective_from_date DATE NOT NULL,
    effective_to_date DATE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT fk_tax_slabs_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT check_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT check_income_range CHECK (min_income < max_income)
);

CREATE INDEX idx_tax_slabs_org_date ON tax_slabs(organization_id, effective_from_date, effective_to_date);
CREATE INDEX idx_tax_slabs_org_income ON tax_slabs(organization_id, min_income, max_income);

-- ============================================================================
-- 3. Salary Structure Table (Employee Salary Components)
-- ============================================================================
CREATE TABLE IF NOT EXISTS salary_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Salary Components
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances JSONB DEFAULT '{}'::jsonb,  -- { "dearness": 10000, "hra": 15000, ... }
    
    -- Validation
    is_active BOOLEAN DEFAULT true,
    effective_from_date DATE NOT NULL,
    effective_to_date DATE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_salary_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT check_basic_salary CHECK (basic_salary > 0)
);

CREATE INDEX idx_salary_employee_active ON salary_structures(employee_id, is_active, effective_from_date);
CREATE INDEX idx_salary_org_date ON salary_structures(organization_id, effective_from_date);

-- ============================================================================
-- 4. Payroll Run Table (Monthly Batch)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Period
    month INTEGER NOT NULL,  -- 1-12
    year INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',  -- DRAFT, FINALIZED, PAID, CANCELLED
    is_locked BOOLEAN DEFAULT false,
    
    -- Summary
    total_employees INTEGER DEFAULT 0,
    total_processed INTEGER DEFAULT 0,
    
    total_gross_salary DECIMAL(15,2) DEFAULT 0,
    total_ssf_employee DECIMAL(15,2) DEFAULT 0,
    total_ssf_employer DECIMAL(15,2) DEFAULT 0,
    total_income_tax DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_net_salary DECIMAL(15,2) DEFAULT 0,
    
    -- Notes
    notes TEXT,
    approval_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finalized_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    created_by UUID,
    finalized_by UUID,
    
    CONSTRAINT fk_payroll_run_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT check_month CHECK (month >= 1 AND month <= 12),
    CONSTRAINT check_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT unique_payroll_run UNIQUE (organization_id, month, year)
);

CREATE INDEX idx_payroll_run_org_period ON payroll_runs(organization_id, year, month);
CREATE INDEX idx_payroll_run_status ON payroll_runs(status, organization_id);

-- ============================================================================
-- 5. Payroll Record Table (Individual Salary Calculation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_run_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Calculation Components
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances JSONB DEFAULT '{}'::jsonb,
    gross_salary DECIMAL(12,2) NOT NULL,
    
    -- SSF Calculation
    ssf_employee_rate DECIMAL(5,2) NOT NULL,
    ssf_employee_amount DECIMAL(12,2) NOT NULL,
    ssf_employer_rate DECIMAL(5,2) NOT NULL,
    ssf_employer_amount DECIMAL(12,2) NOT NULL,
    
    -- Tax Calculation
    taxable_income DECIMAL(12,2) NOT NULL,
    income_tax DECIMAL(12,2) NOT NULL,
    applicable_tax_slab_id UUID,
    
    -- Deductions
    leave_deduction_amount DECIMAL(12,2) DEFAULT 0,
    manual_deduction_amount DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL,
    
    -- Net Salary
    net_salary DECIMAL(12,2) NOT NULL,
    
    -- Status
    record_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',  -- PENDING, CALCULATED, VERIFIED, PAID, ADJUSTED
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT fk_payroll_record_run FOREIGN KEY (payroll_run_id) 
        REFERENCES payroll_runs(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_record_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payroll_record_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_tax_slab_ref FOREIGN KEY (applicable_tax_slab_id) 
        REFERENCES tax_slabs(id) ON DELETE SET NULL
);

CREATE INDEX idx_payroll_record_run ON payroll_records(payroll_run_id);
CREATE INDEX idx_payroll_record_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_record_status ON payroll_records(record_status);

-- ============================================================================
-- 6. Leave Deduction Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_record_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Leave Details
    leave_type VARCHAR(100) NOT NULL,  -- CASUAL, MEDICAL, UNPAID, etc.
    days_deducted DECIMAL(5,2) NOT NULL,  -- Supports half days
    daily_rate DECIMAL(12,2) NOT NULL,
    deduction_amount DECIMAL(12,2) NOT NULL,
    
    -- Reference
    leave_request_id UUID,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    
    CONSTRAINT fk_leave_deduction_record FOREIGN KEY (payroll_record_id) 
        REFERENCES payroll_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leave_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_leave_deduction_record ON leave_deductions(payroll_record_id);
CREATE INDEX idx_leave_deduction_employee ON leave_deductions(employee_id);

-- ============================================================================
-- 7. Manual Deduction Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS manual_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_record_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Deduction Details
    deduction_type VARCHAR(100) NOT NULL,  -- LOAN, PENALTY, ADJUSTMENT, OTHER
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Approval
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT fk_manual_deduction_record FOREIGN KEY (payroll_record_id) 
        REFERENCES payroll_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_manual_deduction_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_manual_deduction_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT check_amount CHECK (amount > 0)
);

CREATE INDEX idx_manual_deduction_record ON manual_deductions(payroll_record_id);
CREATE INDEX idx_manual_deduction_approval ON manual_deductions(is_approved);

-- ============================================================================
-- 8. Payroll Audit Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- What Changed
    entity_type VARCHAR(100) NOT NULL,  -- PayrollRun, PayrollRecord, TaxSlab, etc.
    entity_id UUID NOT NULL,
    
    -- Change Details
    action VARCHAR(50) NOT NULL,  -- CREATE, UPDATE, DELETE, PROCESS, FINALIZE, etc.
    old_values JSONB,
    new_values JSONB,
    
    -- Who & When
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    CONSTRAINT fk_audit_log_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_log_org ON payroll_audit_logs(organization_id, changed_at DESC);
CREATE INDEX idx_audit_log_entity ON payroll_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON payroll_audit_logs(changed_by);

-- ============================================================================
-- 9. Payslip Template Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payslip_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Template Details
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    
    -- Template Content
    header_text TEXT,
    footer_text TEXT,
    show_employer_contributions BOOLEAN DEFAULT true,
    show_bank_details BOOLEAN DEFAULT true,
    
    -- Company Info
    company_logo_url TEXT,
    company_name VARCHAR(255),
    company_address TEXT,
    company_phone VARCHAR(20),
    company_email VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT fk_payslip_template_org FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_payslip_template_org ON payslip_templates(organization_id, is_default);

-- ============================================================================
-- INITIAL DATA SEED
-- ============================================================================

-- Insert default payroll configuration (replace YOUR_ORG_ID with your organization UUID)
INSERT INTO payroll_configuration (
    organization_id,
    ssf_employee_rate,
    ssf_employer_rate,
    minimum_wage,
    taxation_enabled,
    ssf_enabled,
    currency_code
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with actual org ID
    11.00,
    20.00,
    13500.00,
    true,
    true,
    'NPR'
);

-- Insert default tax slabs for Nepal (FY 2024-2025)
-- Current: No tax below 300,000
INSERT INTO tax_slabs (
    organization_id,
    min_income,
    max_income,
    tax_rate,
    relief_amount,
    effective_from_date
) VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 0, 300000, 0, 0, '2024-01-01'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 300001, 700000, 1, 0, '2024-01-01'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 700001, 2000000, 10, 0, '2024-01-01'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 2000001, 999999999, 20, 0, '2024-01-01');

-- Insert default payslip template
INSERT INTO payslip_templates (
    organization_id,
    name,
    is_default,
    show_employer_contributions,
    show_bank_details,
    company_name
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Payslip',
    true,
    true,
    true,
    'Your Organization Name'
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Current Active Salary Structures
CREATE OR REPLACE VIEW v_active_salary_structures AS
SELECT 
    ss.id,
    ss.employee_id,
    ss.organization_id,
    ss.basic_salary,
    ss.allowances,
    ss.effective_from_date,
    e.first_name,
    e.last_name,
    e.email
FROM salary_structures ss
JOIN employees e ON ss.employee_id = e.id
WHERE ss.is_active = true
    AND ss.effective_from_date <= CURRENT_DATE
    AND (ss.effective_to_date IS NULL OR ss.effective_to_date >= CURRENT_DATE);

-- View: Monthly Payroll Summary
CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT 
    pr.id,
    pr.organization_id,
    pr.month,
    pr.year,
    pr.status,
    COUNT(rc.id) as total_records,
    COUNT(CASE WHEN rc.record_status = 'PAID' THEN 1 END) as paid_count,
    SUM(rc.gross_salary)::DECIMAL as total_gross,
    SUM(rc.ssf_employee_amount)::DECIMAL as total_ssf_employee,
    SUM(rc.ssf_employer_amount)::DECIMAL as total_ssf_employer,
    SUM(rc.income_tax)::DECIMAL as total_tax,
    SUM(rc.net_salary)::DECIMAL as total_net,
    pr.created_at,
    pr.finalized_at
FROM payroll_runs pr
LEFT JOIN payroll_records rc ON pr.id = rc.payroll_run_id
GROUP BY pr.id, pr.organization_id, pr.month, pr.year, pr.status, pr.created_at, pr.finalized_at;

-- View: Employee Payroll History
CREATE OR REPLACE VIEW v_employee_payroll_history AS
SELECT 
    pr.id as payroll_run_id,
    rc.id as record_id,
    rc.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    pr.month,
    pr.year,
    rc.gross_salary,
    rc.ssf_employee_amount,
    rc.income_tax,
    rc.net_salary,
    rc.record_status,
    rc.created_at
FROM payroll_records rc
JOIN payroll_runs pr ON rc.payroll_run_id = pr.id
JOIN employees e ON rc.employee_id = e.id
ORDER BY pr.year DESC, pr.month DESC;

-- ============================================================================
-- FUNCTION: Calculate Applicable Tax Slab
-- ============================================================================
CREATE OR REPLACE FUNCTION get_applicable_tax_slab(
    p_org_id UUID,
    p_income DECIMAL,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    id UUID,
    min_income DECIMAL,
    max_income DECIMAL,
    tax_rate DECIMAL,
    relief_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id,
        ts.min_income,
        ts.max_income,
        ts.tax_rate,
        ts.relief_amount
    FROM tax_slabs ts
    WHERE ts.organization_id = p_org_id
        AND p_income BETWEEN ts.min_income AND ts.max_income
        AND ts.effective_from_date <= p_date
        AND (ts.effective_to_date IS NULL OR ts.effective_to_date >= p_date)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Calculate Gross Salary
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_gross_salary(
    p_basic_salary DECIMAL,
    p_allowances JSONB
)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL := p_basic_salary;
BEGIN
    -- Sum all allowances from JSONB object
    SELECT v_total + COALESCE(SUM((value::TEXT)::DECIMAL), 0)
    INTO v_total
    FROM jsonb_each(COALESCE(p_allowances, '{}'::jsonb));
    
    RETURN ROUND(v_total, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Create Audit Log Entry
-- ============================================================================
CREATE OR REPLACE FUNCTION create_audit_log(
    p_org_id UUID,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_action VARCHAR,
    p_old_values JSONB,
    p_new_values JSONB,
    p_changed_by UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO payroll_audit_logs (
        organization_id,
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        changed_by,
        reason,
        changed_at
    ) VALUES (
        p_org_id,
        p_entity_type,
        p_entity_id,
        p_action,
        p_old_values,
        p_new_values,
        p_changed_by,
        p_reason,
        NOW()
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE payroll_configuration IS 'Global payroll settings: SSF rates, tax configuration, minimum wage';
COMMENT ON TABLE tax_slabs IS 'Progressive tax brackets with date-based validity for handling tax law changes';
COMMENT ON TABLE salary_structures IS 'Employee salary components (basic + allowances) with historical tracking';
COMMENT ON TABLE payroll_runs IS 'Monthly payroll batch processing - groups all employee salary calculations';
COMMENT ON TABLE payroll_records IS 'Individual employee payroll calculation for a specific month';
COMMENT ON TABLE leave_deductions IS 'Leave deduction entries linked to payroll records';
COMMENT ON TABLE manual_deductions IS 'Manual adjustments (loans, penalties) requiring approval';
COMMENT ON TABLE payroll_audit_logs IS 'Compliance audit trail - tracks all payroll system changes';
COMMENT ON TABLE payslip_templates IS 'Customizable payslip design and company information';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
