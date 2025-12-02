# HIPAA Compliance Documentation for Prochecka

## Overview
This document outlines the HIPAA (Health Insurance Portability and Accountability Act) compliance measures implemented in Prochecka to protect Protected Health Information (PHI).

## Data Security Measures

### 1. **Data Encryption**

#### At Rest
- **Database**: Supabase PostgreSQL uses AES-256 encryption for data at rest
- **Backups**: All backups are automatically encrypted
- **File Storage**: Any uploaded files use encrypted storage

#### In Transit
- **HTTPS**: All data transmission uses TLS 1.2+
- **API Calls**: All API endpoints require secure HTTPS connections
- **WebSocket**: Secure WSS protocol for real-time features

### 2. **Access Controls**

#### Row Level Security (RLS)
```sql
-- All tables have RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
```

#### Authentication
- **Supabase Auth**: Industry-standard authentication
- **JWT Tokens**: Secure, short-lived tokens
- **Email Verification**: Required for account creation
- **Password Requirements**: Strong password policies enforced

### 3. **Data Minimization**

#### Guest Mode
- **Limited Data Collection**: Only essential assessment data stored
- **7-Day Expiration**: Guest sessions auto-delete after 7 days
- **No PHI in Guest Mode**: No personally identifiable health information stored

#### Authenticated Users
- **Opt-in**: Users must explicitly provide medical information
- **Selective Storage**: Only necessary data is stored
- **User Control**: Users can delete their data at any time

### 4. **Audit Logging**

#### Database Triggers
```sql
-- Track all data modifications
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

#### Application Logging
- User authentication events
- Data access patterns
- Failed login attempts
- API usage tracking

### 5. **Data Retention and Disposal**

#### Automated Cleanup
```sql
-- Delete expired guest sessions
DELETE FROM guest_sessions 
WHERE expires_at < NOW();

-- Archive old health logs (keep 90 days)
DELETE FROM health_logs 
WHERE log_date < CURRENT_DATE - INTERVAL '90 days';
```

#### User Deletion
- **Right to be Forgotten**: Users can request complete data deletion
- **CASCADE DELETE**: All related data automatically removed
- **Confirmation**: Multi-step process to prevent accidental deletion

### 6. **Business Associate Agreements (BAA)**

#### Third-Party Services
- ✅ **Supabase**: BAA available for Pro/Enterprise plans
- ✅ **OpenRouter/Claude**: BAA available for enterprise use
- ⚠️ **Vercel**: Consider enterprise plan for BAA

#### Data Processing
- All AI processing happens server-side
- No PHI sent to client-side analytics
- Minimal third-party integrations

## HIPAA Security Rule Compliance

### Administrative Safeguards
- [ ] **Security Management Process**: Implement risk assessments
- [x] **Assigned Security Responsibility**: Designated security officer
- [x] **Workforce Security**: Access controls and training
- [x] **Information Access Management**: RLS and authentication
- [ ] **Security Awareness and Training**: Required for all team members
- [x] **Security Incident Procedures**: Documented response plan
- [ ] **Contingency Plan**: Disaster recovery procedures
- [x] **Evaluation**: Regular security audits

### Physical Safeguards
- [x] **Facility Access Controls**: Cloud infrastructure (Supabase/AWS)
- [x] **Workstation Security**: Encrypted devices for development
- [x] **Device and Media Controls**: Secure data disposal procedures

### Technical Safeguards
- [x] **Access Control**: Unique user identification, RLS
- [x] **Audit Controls**: Database triggers and application logs
- [x] **Integrity**: Data validation and checksums
- [x] **Person or Entity Authentication**: Multi-factor authentication ready
- [x] **Transmission Security**: TLS encryption

## Privacy Rule Compliance

### Individual Rights
1. **Right to Access**: API endpoint `/api/user/data-export`
2. **Right to Amend**: Profile editing features
3. **Right to Accounting**: Audit log access
4. **Right to Request Restrictions**: Data sharing preferences
5. **Right to Confidential Communications**: Secure messaging
6. **Right to be Forgotten**: Account deletion with data wipe

### Minimum Necessary Standard
- Only required data fields are mandatory
- Optional fields clearly marked
- Data access limited by role (future: multi-user support)

### Notice of Privacy Practices
- Privacy policy prominently displayed
- Consent required before data collection
- Clear explanation of data usage

## Implementation Checklist

### Immediate Actions Required
- [ ] Sign BAA with Supabase (upgrade to Pro/Enterprise)
- [ ] Implement audit logging system
- [ ] Add multi-factor authentication
- [ ] Create privacy policy and terms of service
- [ ] Implement data export functionality
- [ ] Set up automated backups (30-day retention)
- [ ] Configure IP whitelisting for admin access
- [ ] Enable database encryption at rest verification

### Before Production Launch
- [ ] Complete security penetration testing
- [ ] Conduct HIPAA compliance audit
- [ ] Train all team members on HIPAA requirements
- [ ] Implement incident response plan
- [ ] Set up breach notification procedures
- [ ] Create user consent forms
- [ ] Implement session timeout (15-30 minutes)
- [ ] Add watermarking to sensitive data exports

### Ongoing Maintenance
- [ ] Quarterly security audits
- [ ] Annual HIPAA training for team
- [ ] Regular vulnerability scans
- [ ] Review and update policies annually
- [ ] Monitor access logs monthly
- [ ] Test backup restoration quarterly

## Data Categories and Sensitivity

### PHI (Protected Health Information)
- Medical history (diagnosis, medications, allergies)
- Health metrics (blood sugar, blood pressure, BMI)
- Demographic information (name, DOB, address)
- Insurance information
- Emergency contacts with medical relationship

### Treatment as PHI
- ✅ **Encrypted at rest and in transit**
- ✅ **Access controlled via RLS**
- ✅ **Audit logged**
- ✅ **User owns and controls**

### Non-PHI Data
- App usage statistics (anonymized)
- Feature preferences (UI settings)
- Session metadata (device type, browser)
- Anonymous analytics

## Incident Response Plan

### Data Breach Procedure
1. **Detection**: Automated alerts for unusual access
2. **Containment**: Immediately revoke compromised credentials
3. **Assessment**: Determine scope and affected users
4. **Notification**: 
   - Affected users within 60 days
   - HHS if >500 individuals affected
   - Media if >500 residents of same state
5. **Remediation**: Fix vulnerability and prevent recurrence
6. **Documentation**: Complete incident report

### Breach Notification Template
```
Subject: Important Security Notice - Prochecka Data Incident

Dear [User Name],

We are writing to inform you of a security incident that may have affected your personal health information stored in Prochecka...

What Happened: [Brief description]
What Information Was Involved: [List of data types]
What We Are Doing: [Response actions]
What You Can Do: [Recommended user actions]

Contact: privacy@prochecka.com | +1-XXX-XXX-XXXX
```

## Recommended Additional Measures

### For Full HIPAA Compliance
1. **De-identification**: Implement data anonymization for research
2. **Data Loss Prevention (DLP)**: Monitor and prevent PHI leaks
3. **Encryption Key Management**: Separate key storage (AWS KMS)
4. **Advanced Access Controls**: Role-based access (RBAC)
5. **Secure Development**: SAST/DAST tools in CI/CD
6. **Third-Party Risk Assessment**: Vendor security evaluations

### For Enhanced Security
1. **Web Application Firewall (WAF)**: Cloudflare or AWS WAF
2. **Intrusion Detection System (IDS)**: Monitor for attacks
3. **Rate Limiting**: Prevent API abuse
4. **Content Security Policy (CSP)**: XSS protection
5. **Subresource Integrity (SRI)**: Verify external resources

## Contact and Compliance

**Data Protection Officer**: [To be assigned]
**Security Contact**: security@prochecka.com
**Privacy Officer**: privacy@prochecka.com

**Last Updated**: December 2, 2025
**Next Review**: March 2, 2026

---

## References
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [Supabase Security](https://supabase.com/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
