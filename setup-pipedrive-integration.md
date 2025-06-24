# Pipedrive Integration Setup Guide

This guide will help you set up the Pipedrive integration to automatically create deals from your contact form submissions, replacing your Make.com workflow.

## 🔧 Prerequisites

1. **Pipedrive API Token**: Get your API token from Pipedrive settings
2. **Supabase Project**: Your project should have the contact_submissions table
3. **Supabase CLI**: For deploying edge functions

## 📝 Setup Steps

### 1. Set Environment Variables

In your Supabase dashboard, go to Settings > Edge Functions and add these environment variables:

```
PIPEDRIVE_API_TOKEN=your_pipedrive_api_token_here
PIPEDRIVE_COMPANY_DOMAIN=trebound
```

### 2. Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy pipedrive-webhook
```

### 3. Set up Database Webhook

Run the SQL from `sql/07_pipedrive_webhook.sql` in your Supabase SQL editor:

**Important**: Update the webhook URL in the SQL file to match your actual Supabase project URL:
```sql
webhook_url text := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/pipedrive-webhook';
```

### 4. Test the Integration

1. Fill out any contact form on your website
2. Check your Supabase logs in the Functions tab
3. Verify that a new person and deal were created in Pipedrive

## 🔄 What This Replaces

This integration exactly replicates your Make.com workflow:

| Make.com Step | New Implementation |
|---------------|-------------------|
| **Google Sheets Trigger** | ✅ Supabase database trigger |
| **Create Person** | ✅ Pipedrive API call |
| **Create Deal** | ✅ Pipedrive API call with all custom fields |
| **Send Email** | ✅ Email notification (ready for your email service) |
| **Create Note** | ✅ Pipedrive API call |

## 📊 Custom Fields Mapping

Your Make.com custom fields are preserved:

- **Lead Generation**: Digital (97)
- **Team Size**: From number_of_pax
- **Type of Program**: From activity_type
- **URL**: From page_url
- **Lead Location**: From preferred_destination
- **Lead Source**: trebound.com (16)
- **Email ID**: From work_email
- **Page Source**: From page_url

## 🚨 Troubleshooting

1. **Function not triggering**: Check Supabase Functions logs
2. **Pipedrive API errors**: Verify your API token and custom field IDs
3. **Missing data**: Check the contact_submissions table structure

## 🔧 Customization

To modify the integration:

1. **Update custom fields**: Edit the field IDs in `supabase/functions/pipedrive-webhook/index.ts`
2. **Change email template**: Modify the `sendEmailNotification` method
3. **Add new fields**: Update both the ContactSubmission interface and the API calls

## 💡 Benefits Over Make.com

- ✅ **No monthly Make.com cost**
- ✅ **Faster processing** (direct API calls)
- ✅ **Better error handling** and logging
- ✅ **More reliable** (no external dependencies)
- ✅ **Easier to maintain** and customize

## 📞 Support

If you need help with the setup, check:
1. Supabase Functions logs for errors
2. Pipedrive API documentation for field IDs
3. Contact submissions in your database

The integration is now ready to automatically create Pipedrive deals from all your website form submissions! 