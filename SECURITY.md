# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### Private Disclosure

For security vulnerabilities, please do NOT create a public GitHub issue. Instead:

1. **Email**: Send details to dsouzalima438@gmail.com
2. **Subject**: Include "SECURITY" in the subject line
3. **Details**: Provide:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Status Updates**: Every 5 business days until resolved
- **Fix Timeline**: Security fixes are prioritized and typically released within 2 weeks

### Disclosure Policy

- We will investigate all legitimate reports
- We will provide credit for responsible disclosure
- We ask that you do not publicly disclose the vulnerability until we have had a chance to address it

## Security Measures

### Platform Security

- Authentication via Supabase with secure JWT tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Infrastructure Security

- HTTPS enforced for all connections
- Secure file upload with validation
- Environment variable protection
- Regular dependency updates

### Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Code review requirements
- Automated testing including security tests

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/overview)
- [React Security](https://react.dev/learn/keeping-components-pure)

Thank you for helping keep Kryzon secure!