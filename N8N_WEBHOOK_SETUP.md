# N8N Webhook Integration Setup

This document explains how to set up and configure n8n webhook integration for all form submissions in the Trebound website.

## Overview

The webhook service has been integrated into all form submission flows to send data to n8n for processing, automation, and integration with external services. The integration is designed to be:

- **Non-blocking**: Webhook failures won't prevent form submissions
- **Fire-and-forget**: Forms submit immediately without waiting for webhook response
- **Comprehensive**: Covers all form types on the website

## Supported Form Types

The following forms now send data to n8n webhook:

1. **Contact Forms** (`formType: 'contact'`)
   - Main Contact page form
   - ContactSection component forms
   - Quote modal forms
   - Skip search popup forms

2. **Newsletter Forms** (`formType: 'newsletter'`)
   - Footer newsletter subscription
   - NewsletterSection component

3. **Job Applications** (`formType: 'job_application'`)
   - Careers page application forms

4. **Partner Registration** (`formType: 'partner_registration'`)
   - Global partner registration forms

5. **Bangalore Resorts** (`formType: 'bangalore_resorts'`)
   - Bangalore resorts access forms

## Configuration

### Environment Variables

Add the following environment variable to your `.env` file:

```bash
# N8N Webhook Configuration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### N8N Webhook Setup

1. **Create a Webhook Node in N8N**
   - Add a "Webhook" node to your workflow
   - Set HTTP Method to "POST"
   - Configure authentication if needed
   - Copy the webhook URL

2. **Expected Webhook Payload Structure**

All webhooks send a JSON payload with this base structure:

```typescript
interface WebhookData {
  // Common fields for all forms
  formType: 'contact' | 'newsletter' | 'job_application' | 'partner_registration' | 'bangalore_resorts';
  timestamp: string;         // ISO 8601 format
  pageUrl: string;          // Current page URL
  pageTitle: string;        // Page title
  user_agent?: string;      // Browser user agent
  
  // Form-specific fields (varies by formType)
  // ... see detailed schemas below
}
```

## Detailed Webhook Schemas

### Contact Forms (`formType: 'contact'`)

```json
{
  "formType": "contact",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pageUrl": "https://trebound.com/contact",
  "pageTitle": "Contact Us - Trebound",
  "user_agent": "Mozilla/5.0...",
  "name": "John Doe",
  "work_email": "john@company.com",
  "phone": "+91-9876543210",
  "company": "Acme Corp",
  "preferred_destination": "Bangalore",
  "number_of_pax": 25,
  "more_details": "Looking for team building activities...",
  "activity_type": "exploring"
}
```

### Newsletter Forms (`formType: 'newsletter'`)

```json
{
  "formType": "newsletter",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pageUrl": "https://trebound.com/",
  "pageTitle": "Trebound - Home",
  "user_agent": "Mozilla/5.0...",
  "newsletter_email": "user@example.com"
}
```

### Job Applications (`formType: 'job_application'`)

```json
{
  "formType": "job_application",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pageUrl": "https://trebound.com/jobs",
  "pageTitle": "Careers - Trebound",
  "user_agent": "Mozilla/5.0...",
  "job_id": 123,
  "job_title": "Software Developer",
  "applicant_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91-9876543210",
  "resume_url": "https://example.com/resume.pdf",
  "portfolio_url": "https://portfolio.com",
  "cover_letter": "I am interested in...",
  "experience_years": "3",
  "current_company": "Tech Corp",
  "notice_period": "30 days",
  "expected_salary": "15 LPA"
}
```

### Partner Registration (`formType: 'partner_registration'`)

```json
{
  "formType": "partner_registration",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pageUrl": "https://trebound.com/global-partner-registration",
  "pageTitle": "Partner Registration - Trebound",
  "user_agent": "Mozilla/5.0...",
  "company_name": "Adventure Co",
  "website": "https://adventureco.com",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@adventureco.com",
  "phone": "+91-9876543210",
  "country": "India",
  "city": "Bangalore",
  "company_type": "Adventure Tourism",
  "employee_count": "10-50",
  "years_in_business": "5",
  "services_offered": ["Team Building", "Adventure Activities"],
  "more_details": "We specialize in..."
}
```

### Bangalore Resorts (`formType: 'bangalore_resorts'`)

```json
{
  "formType": "bangalore_resorts",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pageUrl": "https://trebound.com/bangalore-resorts",
  "pageTitle": "Bangalore Resorts - Trebound",
  "user_agent": "Mozilla/5.0...",
  "name": "John Doe",
  "email": "john@company.com",
  "company": "Tech Corp",
  "phone": "+91-9876543210",
  "team_size": "20-30",
  "more_details": "Looking for team outing venues..."
}
```

## N8N Workflow Examples

### Basic Webhook Processing

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "trebound-forms",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.formType}}",
              "operation": "equal",
              "value2": "contact"
            }
          ]
        }
      },
      "name": "Is Contact Form?",
      "type": "n8n-nodes-base.if"
    },
    {
      "parameters": {
        "responseCode": 200,
        "responseBody": "{\"success\": true, \"message\": \"Webhook received\"}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ]
}
```

### Integration Ideas

1. **CRM Integration**: Send contact forms to Pipedrive, Salesforce, or HubSpot
2. **Email Notifications**: Send alerts to sales team on new leads
3. **Slack/Teams Notifications**: Notify teams of new applications or contacts
4. **Data Storage**: Store form data in databases or Google Sheets
5. **Lead Scoring**: Analyze and score leads based on form data
6. **Automated Follow-ups**: Trigger email sequences based on form type

## Testing

### Test Webhook Locally

You can test the webhook integration by:

1. Using ngrok to expose your local n8n instance
2. Setting up a webhook.site URL for testing
3. Using Postman to simulate webhook calls

### Sample Test Payload

```bash
curl -X POST "YOUR_N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "contact",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pageUrl": "https://trebound.com/contact",
    "pageTitle": "Contact Us - Trebound",
    "name": "Test User",
    "work_email": "test@example.com",
    "phone": "+91-9876543210",
    "more_details": "Test webhook integration"
  }'
```

## Error Handling

- Webhook failures are logged to console but don't block form submissions
- All webhook calls are non-blocking and fire-and-forget
- Original form functionality remains intact even if webhook fails
- Network timeouts are handled gracefully

## Monitoring

Monitor webhook performance through:

1. **Browser Console**: Check for webhook success/failure logs
2. **N8N Execution Logs**: Monitor webhook execution in n8n
3. **Analytics**: Track webhook success rates

## Security Considerations

1. **HTTPS Only**: Always use HTTPS webhook URLs
2. **Authentication**: Consider adding webhook authentication
3. **Rate Limiting**: Implement rate limiting in n8n if needed
4. **Data Validation**: Validate incoming webhook data in n8n

## Troubleshooting

### Common Issues

1. **Webhook URL not configured**: Check `VITE_N8N_WEBHOOK_URL` environment variable
2. **CORS Issues**: Ensure n8n allows cross-origin requests
3. **Timeout Issues**: Check n8n webhook timeout settings
4. **Data Format Issues**: Verify webhook payload structure

### Debug Mode

Enable debug logging by checking browser console for webhook-related messages:
- `Sending data to n8n webhook:` - Data being sent
- `Successfully sent data to n8n webhook` - Success messages
- `N8N webhook failed (non-blocking):` - Error messages

## Updates and Maintenance

- Monitor webhook performance regularly
- Update webhook schemas when adding new form fields
- Test webhook integration after any form modifications
- Keep n8n workflows updated and optimized 