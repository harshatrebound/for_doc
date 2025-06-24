interface PipedriveConfig {
  apiToken: string;
  companyDomain: string;
}

interface ContactSubmission {
  id: number;
  name: string;
  work_email: string;
  preferred_destination: string;
  phone: string;
  number_of_pax: number;
  more_details?: string;
  activity_type: 'outbound' | 'virtual' | 'hybrid' | 'exploring';
  page_url: string;
  page_heading: string;
  created_at: string;
  status: string;
}

interface PipedrivePersonResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: Array<{ value: string; primary: boolean }>;
  };
}

interface PipedriveDealResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    status: string;
  };
}

export class PipedriveIntegration {
  private config: PipedriveConfig;
  private baseUrl: string;

  constructor(config: PipedriveConfig) {
    this.config = config;
    this.baseUrl = `https://${config.companyDomain}.pipedrive.com/api/v1`;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}?api_token=${this.config.apiToken}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a person in Pipedrive (Step 2 from Make.com flow)
   */
  async createPerson(submission: ContactSubmission): Promise<PipedrivePersonResponse> {
    const personData = {
      name: `${submission.name} Deal`,
      email: [
        {
          label: 'Email',
          value: submission.work_email,
          primary: true
        }
      ],
      phone: [
        {
          label: 'Phone',
          value: submission.phone
        }
      ],
      // Page Source custom field (ID from Make.com: 14be1bfe7398a76d25117f678216ffd2f27799db)
      '14be1bfe7398a76d25117f678216ffd2f27799db': submission.page_url
    };

    return this.makeRequest('/persons', 'POST', personData);
  }

  /**
   * Create a deal in Pipedrive (Step 4 from Make.com flow)
   */
  async createDeal(submission: ContactSubmission, personId: number): Promise<PipedriveDealResponse> {
    const dealData = {
      title: submission.name,
      status: 'open',
      user_id: 2892916, // Anchit Singh from Make.com
      stage_id: 27, // Lead In stage
      person_id: personId,
      // Custom fields mapping from Make.com:
      '070c2dbfde5c886a586a7a9cf37f5ce86d4f9b39': 97, // Lead Generation: Digital
      '215eb21241eef3434cf373744d8d099cef03021f': submission.number_of_pax.toString(), // Team Size
      '55998c8fe1b41d3ef219bcc39402380512657aa3': submission.activity_type, // Type of Program
      '6fb00b8718565ffe1a83f122b16a0f9cbe8b09cf': submission.page_url, // URL
      '7954c60cdac31dc90cfa59617c4791eb28a8438d': submission.preferred_destination, // Lead Location
      '9d3c36a1225fc6497a40da3d1d051baa09ba1f59': 16, // Lead Source: trebound.com
      'f842039bcb93f119fe8145c6eb97293bd91be1b9': submission.work_email // email ID
    };

    return this.makeRequest('/deals', 'POST', dealData);
  }

  /**
   * Create a note for the deal (Step 9 from Make.com flow)
   */
  async createNote(submission: ContactSubmission, dealId: number, personId: number) {
    const noteData = {
      content: `Message: ${submission.more_details || 'No additional details'}\nPage: ${submission.page_heading}`,
      deal_id: dealId,
      person_id: personId,
      add_time: submission.created_at
    };

    return this.makeRequest('/notes', 'POST', noteData);
  }

  /**
   * Send email notification (Step 5 from Make.com flow)
   */
  async sendEmailNotification(submission: ContactSubmission) {
    // This would typically use your email service (Gmail API, SendGrid, etc.)
    const emailContent = {
      to: ['sales@trebound.com'],
      subject: 'New Deal Added to Pipedrive - Lead In Stage',
      html: `
        <body>
          <p>Hi Team,</p>
          <p>A new deal has been added to the Pipedrive in the <strong>Lead In</strong> stage of <strong>Deals Pipeline</strong>. Please find the details below: (Empty fields denote no value provided from lead)</p>
          <ul>
            <li><strong>Name</strong>: ${submission.name}</li>
            <li><strong>Email</strong>: ${submission.work_email}</li>
            <li><strong>Phone</strong>: ${submission.phone}</li>
            <li><strong>No Of Pax</strong>: ${submission.number_of_pax}</li>
            <li><strong>Message</strong>: ${submission.more_details || 'No message provided'}</li>
            <li><strong>Type of Activity</strong>: ${submission.activity_type}</li>
            <li><strong>URL</strong>: ${submission.page_url}</li>
            <li><strong>Preferred Destination</strong>: ${submission.preferred_destination}</li>
          </ul>
          <p>Please review the details.</p>
          <p>Thanks,<br>Digital Trebound</p>
        </body>
      `
    };

    // Return email data for processing by your email service
    return emailContent;
  }

  /**
   * Main function to process contact submission (replicates entire Make.com flow)
   */
  async processContactSubmission(submission: ContactSubmission) {
    try {
      console.log(`Processing contact submission for: ${submission.name}`);

      // Step 1: Create person in Pipedrive
      const personResponse = await this.createPerson(submission);
      
      if (!personResponse.success) {
        throw new Error('Failed to create person in Pipedrive');
      }

      console.log(`Created person with ID: ${personResponse.data.id}`);

      // Step 2: Create deal in Pipedrive  
      const dealResponse = await this.createDeal(submission, personResponse.data.id);
      
      if (!dealResponse.success) {
        throw new Error('Failed to create deal in Pipedrive');
      }

      console.log(`Created deal with ID: ${dealResponse.data.id}`);

      // Step 3: Create note for the deal
      await this.createNote(submission, dealResponse.data.id, personResponse.data.id);
      
      console.log(`Created note for deal: ${dealResponse.data.id}`);

      // Step 4: Prepare email notification
      const emailData = await this.sendEmailNotification(submission);
      
      console.log('Email notification prepared');

      return {
        success: true,
        personId: personResponse.data.id,
        dealId: dealResponse.data.id,
        emailData
      };

    } catch (error) {
      console.error('Error processing contact submission:', error);
      throw error;
    }
  }
}

// Export function to create Pipedrive integration instance
export function createPipedriveIntegration() {
  // Only create integration if we're in a browser environment with the API token
  if (typeof window === 'undefined') {
    throw new Error('Pipedrive integration only available in browser environment');
  }

  const config: PipedriveConfig = {
    apiToken: import.meta.env.VITE_PIPEDRIVE_API_TOKEN || '',
    companyDomain: 'trebound' // Based on the Make.com connection
  };

  if (!config.apiToken) {
    throw new Error('VITE_PIPEDRIVE_API_TOKEN environment variable is required');
  }

  return new PipedriveIntegration(config);
} 