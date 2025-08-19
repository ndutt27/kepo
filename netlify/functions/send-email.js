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
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Pictlord Photos Are Ready!</title>
    <style>
        /* Google Font Import - for clients that support it */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Basic Reset & Modern Font Styles */
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            line-height: 1.6;
            color: #52525b; /* Zinc 600 - Softer text */
            background-color: #f8fafc; /* Slate 50 - Clean, light background */
            margin: 0;
            padding: 0;
            width: 100% !important;
        }

        /* Wrapper for the whole email */
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 48px 24px;
            box-sizing: border-box;
        }

        /* Main container with a modern card look */
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px; /* Larger, softer corners */
            border: 1px solid #e2e8f0; /* Slate 200 */
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Softer, more layered shadow */
        }

        /* Header section with logo */
        .header {
            padding: 32px 40px;
            text-align: center;
            border-bottom: 1px solid #f1f5f9; /* Slate 100 for a subtle divider */
        }
        .header img {
            max-width: 120px;
        }

        /* Content section */
        .content {
            padding: 40px 48px;
            text-align: center;
        }
        .content .icon-container {
            margin-bottom: 24px;
        }
        .content h1 {
            font-size: 28px;
            font-weight: 700;
            color: #18181b; /* Zinc 900 - Darker heading for contrast */
            margin: 0 0 16px;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 32px;
            color: #52525b; /* Zinc 600 */
        }

        /* Button styles */
        .button-container {
            text-align: center;
        }
        .button {
            background-color: #0D9488; /* Teal 600 */
            color: #ffffff !important; /* Important to override link styles */
            padding: 16px 36px;
            text-decoration: none;
            border-radius: 12px; /* Matching softer corners */
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(13, 148, 136, 0.1), 0 1px 3px rgba(13, 148, 136, 0.08);
        }
        .button:hover {
            background-color: #0f766e; /* Teal 700 */
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(13, 148, 136, 0.1), 0 3px 6px rgba(13, 148, 136, 0.08);
        }

        /* Expiration warning section */
        .warning-box {
            background-color: #fffbeb; /* Amber 50 */
            border-radius: 12px;
            padding: 20px;
            margin-top: 32px;
            text-align: center;
            display: flex; /* Using flexbox for alignment */
            align-items: center;
            justify-content: center;
            gap: 12px; /* Space between icon and text */
        }
        .warning-box p {
            color: #b45309; /* Amber 700 */
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            line-height: 1.4;
        }
        .warning-box p strong {
            color: #92400e; /* Amber 800 */
        }

        /* Footer section */
        .footer {
            padding: 32px 40px;
            font-size: 13px;
            color: #718096; /* Slate 500 */
            text-align: center;
            background-color: #f8fafc; /* Slate 50 */
            border-top: 1px solid #f1f5f9; /* Slate 100 */
        }
        .footer .social-links {
            margin-bottom: 20px;
        }
        .footer .social-links a {
            display: inline-block;
            margin: 0 10px;
            transition: opacity 0.2s;
        }
        .footer .social-links a:hover {
            opacity: 0.7;
        }
        .footer .company-info {
            color: #a0aec0; /* Slate 400 for a lighter touch */
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header with Logo -->
            <div class="header">
                <a href="https://www.pictlord.me" target="_blank">
                    <img src="https://www.pictlord.me/images/pictlord%20logo.png" alt="Pictlord Logo" onerror="this.onerror=null;this.src='https://placehold.co/120x40/ffffff/0D9488?text=Pictlord';">
                </a>
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="icon-container">
                    <!-- Sparkle Icon -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto;">
                        <path d="M12 2.5L13.16 8.84L19.5 10L13.16 11.16L12 17.5L10.84 11.16L4.5 10L10.84 8.84L12 2.5Z" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18 15L18.5 17.5L21 18L18.5 18.5L18 21L17.5 18.5L15 18L17.5 17.5L18 15Z" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h1>Foto Anda Sudah Siap! ✨</h1>
                <p>Terima kasih telah menggunakan <b>Pictlord</b>! Sesuai permintaan Anda, berikut adalah tautan untuk melihat dan mengunduh photo strip, GIF animasi, dan pose individual Anda.</p>
                
                <!-- Main Call-to-Action Button -->
                <div class="button-container">
                    <a href="{{download_link}}" class="button">Lihat & Unduh Foto</a>
                </div>

                <!-- Expiration Warning -->
                <div class="warning-box">
                    <!-- Lock Icon -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9M5 9H19V21H5V9Z" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>Tautan ini unik untuk Anda dan akan <strong>kedaluwarsa dalam 7 hari.</strong></p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="social-links">
                    <!-- Instagram Icon -->
                    <a href="https://www.instagram.com/off.xlord/" target="_blank" title="Instagram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#718096" stroke-width="2"/>
                            <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1515 13.8416 15.5297C13.0901 15.9079 12.2384 16.0397 11.4078 15.905C10.5771 15.7703 9.80973 15.3773 9.21479 14.7823C8.61985 14.1874 8.22685 13.42 8.09215 12.5894C7.95744 11.7587 8.08925 10.907 8.46744 10.1555C8.84563 9.40404 9.45134 8.7908 10.1981 8.4033C10.9449 8.0158 11.7948 7.87375 12.627 8C13.4908 8.12835 14.2933 8.54499 14.9193 9.17095C15.5452 9.79692 15.9619 10.5994 16.0902 11.4632L16 11.37Z" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17.5 6.5H17.51" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <!-- TikTok Icon (Corrected) -->
                    <a href="https://www.tiktok.com/@xlordduyy" target="_blank" title="TikTok">
                        <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="#718096" fill="none" stroke-linecap="round" stroke-linejoin="round">
                           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                           <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5"></path>
                        </svg>
                    </a>
                    <!-- Website Icon -->
                    <a href="https://www.pictlord.me" target="_blank" title="Website">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 12H22" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
                <div class="company-info">
                    &copy; 2025 Pictlord. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
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
