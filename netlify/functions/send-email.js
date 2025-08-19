const { Resend } = require('resend');

exports.handler = async (event) => {
  // 1. Check for POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 2. Parse the request body
    const { to_email, download_link } = JSON.parse(event.body);

    // 3. Basic validation
    if (!to_email || !download_link) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing to_email or download_link in request body' }),
      };
    }

    // Initialize Resend with the API key from environment variables
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 4. Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // This needs to be a verified domain on Resend
      to: [to_email],
      subject: 'Your Pictlord Photos are here!',
      html: `
        <h1>Here are your photos!</h1>
        <p>Thank you for using Pictlord. You can download your customized photos using the link below.</p>
        <p><a href="${download_link}" style="display:inline-block;padding:10px 20px;font-size:16px;color:white;background-color:#E28585;text-decoration:none;border-radius:5px;">Download Your Photos</a></p>
        <p>This link will be active for 7 days.</p>
        <br>
        <p>Best regards,</p>
        <p>The Pictlord Team</p>
      `,
    });

    // 5. Handle Resend API errors
    if (error) {
      console.error({ error });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email.' }),
      };
    }

    // 6. Send success response
    console.log('Email sent successfully:', data);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };

  } catch (error) {
    // Handle unexpected errors
    console.error('An unexpected error occurred:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
