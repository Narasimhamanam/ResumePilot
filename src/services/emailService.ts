import { ConnectedEmailAccount } from '../types';

export interface EmailSendOptions {
  to: string;
  subject: string;
  body: string;
  resumeFileName?: string;
  resumeTextOrBlob?: string;
  fromAccount: ConnectedEmailAccount;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface EmailServiceProvider {
  name: string;
  sendEmail(options: EmailSendOptions): Promise<EmailSendResult>;
}

// Gmail Implementation using official Gmail REST API with RFC 2822 formatting
export class GmailEmailService implements EmailServiceProvider {
  name = 'Gmail OAuth Service';

  async sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
    const accessToken = (options.fromAccount as any).accessToken;
    if (!accessToken) {
      return {
        success: false,
        error: 'Gmail authorization expired or missing OAuth access token. Please re-authenticate your Google account.',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // RFC 2822 email format
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(options.subject)))}?=`;
      const messageParts = [
        `From: ${options.fromAccount.email}`,
        `To: ${options.to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        options.body,
      ];
      const message = messageParts.join('\n');
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Gmail API error (${response.status}): ${errJson.error?.message || response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error while contacting Gmail API',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
