const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { to_email, download_link } = JSON.parse(event.body);

    if (!to_email || !download_link) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing to_email or download_link in request body' }),
      };
    }

    // Read the HTML template
    const templatePath = path.resolve(__dirname, 'email-template.html');
    const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Replace the placeholder with the actual download link
    const emailHtml = emailTemplate.replace('{{download_link}}', download_link);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to_email],
      subject: 'Your Pictlord Photos are here!',
      html: emailHtml,
    });

    if (error) {
      console.error({ error });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
