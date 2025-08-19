const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 1. Check for Environment Variables
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Missing required environment variables.' }),
    };
  }

  let to_email, download_link;
  try {
    // 2. Parse incoming data
    const body = JSON.parse(event.body);
    to_email = body.to_email;
    download_link = body.download_link;
    if (!to_email || !download_link) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing to_email or download_link in request body' }) };
    }
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Could not parse JSON body.' }) };
  }

  let emailHtml;
  try {
    // 3. Read email template
    const templatePath = path.resolve(__dirname, 'email-template.html');
    const emailTemplate = fs.readFileSync(templatePath, 'utf-8');
    emailHtml = emailTemplate.replace('{{download_link}}', download_link);
  } catch (error) {
    console.error('Failed to read or process email template:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: Could not load email template.' }),
    };
  }

  try {
    // 4. Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to_email],
      subject: 'Your Pictlord Photos are here!',
      html: emailHtml,
    });

    if (resendError) {
      // This is an error returned by the Resend API itself
      console.error('Resend API Error:', resendError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Resend API Error: ${resendError.message}` }),
      };
    }

    // Success
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };

  } catch (error) {
    // This catches other unexpected errors during the Resend call
    console.error('An unexpected error occurred during email sending:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `An unexpected internal server error occurred: ${error.message}` }),
    };
  }
};
