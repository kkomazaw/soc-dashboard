# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in SOC Dashboard, please report it by emailing the maintainers. **Do not** create a public GitHub issue for security vulnerabilities.

## Secure Configuration

### Environment Variables

The application uses environment variables to store sensitive API keys. **Never commit your `.env` file to version control.**

#### Required Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env` (optional - application works without them):
   ```env
   # VirusTotal API (for enhanced IoC analysis)
   VIRUSTOTAL_API_KEY=your_api_key_here

   # AbuseIPDB API (for IP reputation checks)
   ABUSEIPDB_API_KEY=your_api_key_here

   # NVD API (for better CVE rate limits)
   NVD_API_KEY=your_api_key_here
   ```

3. **Verify .env is in .gitignore** (already configured):
   ```bash
   grep ".env" .gitignore
   ```

### API Keys Security

#### Where to Get API Keys

- **VirusTotal**: https://www.virustotal.com/gui/my-apikey
- **AbuseIPDB**: https://www.abuseipdb.com/account/api
- **NVD**: https://nvd.nist.gov/developers/request-an-api-key

#### API Key Protection

✅ **DO**:
- Keep API keys in `.env` file only
- Use `.env.example` for documentation (with placeholder values)
- Rotate API keys regularly
- Use read-only API keys when possible
- Limit API key permissions to minimum required

❌ **DON'T**:
- Commit `.env` to version control
- Share API keys in public channels
- Hard-code API keys in source files
- Use production keys in development

### Running in Production

#### Environment Variables

Set these in your production environment:

```bash
# Required
DATABASE_URL="file:./prod.db"

# Optional (for enhanced features)
VIRUSTOTAL_API_KEY="your_production_key"
ABUSEIPDB_API_KEY="your_production_key"
NVD_API_KEY="your_production_key"
```

#### Security Headers

The application should be served behind a reverse proxy (nginx, Apache) with security headers:

```nginx
# Example nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

## Dependency Security

### Checking for Vulnerabilities

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix non-breaking vulnerabilities
npm audit fix

# Check severity levels
npm audit --audit-level=moderate
```

### Current Known Issues

As of the last audit, there are:
- **1 critical**: Older glob version (dev dependency, low risk)
- **16 high**: Mostly in build tools (dev dependencies)
- **28 moderate**: Development dependencies
- **2 low**: Minimal impact

Most vulnerabilities are in development dependencies and don't affect production runtime.

### Updating Dependencies

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update specific package
npm install package-name@latest
```

## Authentication & Authorization

### Current Implementation

The current version (v1.0.0) does **not include authentication**. It is designed for:
- Internal use on trusted networks
- Local development
- Behind existing authentication layers (VPN, SSO)

### Future Enhancements

For production deployments requiring authentication:

1. **Add Authentication Layer**:
   - JWT-based authentication
   - OAuth 2.0 / SAML integration
   - API key authentication for programmatic access

2. **Implement RBAC**:
   - Admin role (full access)
   - Analyst role (read + search)
   - Viewer role (read-only)

3. **Audit Logging**:
   - Track user actions
   - Monitor API usage
   - Alert on suspicious activity

## Network Security

### Firewall Rules

Recommended firewall configuration:

```bash
# Frontend (Vite dev server)
Allow: localhost:5173 (development only)

# Backend API
Allow: localhost:3001 (internal access)

# Database
Allow: localhost:5432 (internal access)

# Outbound (required for data fetching)
Allow: HTTPS to:
  - cisa.gov (CISA KEV data)
  - jvn.jp (JVN data)
  - nvd.nist.gov (NVD data)
  - virustotal.com (VirusTotal API)
  - abuseipdb.com (AbuseIPDB API)
```

### HTTPS/TLS

For production:
- Always use HTTPS
- Use valid SSL/TLS certificates
- Enable HTTP Strict Transport Security (HSTS)
- Disable insecure protocols (TLS 1.0, 1.1)

## Data Security

### Data Storage

- **Database**: SQLite (local file-based)
- **Cached Data**: Temporary in-memory storage
- **Web Vitals**: sessionStorage (browser, non-sensitive)

### Data Privacy

- No personal user data is collected
- No tracking or analytics by default
- All threat intelligence data is public information
- API keys are stored locally only

### Data Retention

- Vulnerability data: Refreshed automatically
- Cache: Cleared on page reload
- Logs: Rotate daily (if enabled)

## Incident Response

### If API Keys Are Compromised

1. **Immediate Actions**:
   ```bash
   # Remove keys from .env
   vim .env

   # Regenerate keys on provider platforms
   # - VirusTotal: https://www.virustotal.com/gui/my-apikey
   # - AbuseIPDB: https://www.abuseipdb.com/account/api
   # - NVD: https://nvd.nist.gov/developers/request-an-api-key

   # Update .env with new keys
   vim .env

   # Restart application
   npm run dev:all
   ```

2. **Check Git History**:
   ```bash
   # Search for leaked secrets
   git log -p | grep -i "api_key"

   # If found in history, use git-filter-repo or BFG Repo-Cleaner
   ```

3. **Notify Stakeholders**: If production keys were exposed

### If System Is Compromised

1. Isolate the system from network
2. Preserve logs and evidence
3. Investigate root cause
4. Patch vulnerabilities
5. Restore from clean backup
6. Rotate all credentials
7. Document incident

## Security Checklist

Before deploying to production:

- [ ] All `.env` files excluded from version control
- [ ] API keys rotated and secured
- [ ] Dependencies updated (`npm update`)
- [ ] Security audit passed (`npm audit`)
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Firewall rules applied
- [ ] Authentication implemented (if required)
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Security testing performed

## Compliance

### Data Handling

- All data sources are public threat intelligence feeds
- No GDPR/CCPA concerns (no PII collected)
- Suitable for government/enterprise use

### License

- MIT License (permissive open source)
- No warranty provided
- Use at own risk

## Contact

For security concerns, please contact:
- Create a security advisory on GitHub (private disclosure)
- Email: [Your security contact email]

## Version History

- **v1.0.0** (2026-11-04): Initial security policy

---

**Last Updated**: 2026-11-04
**Status**: Active
