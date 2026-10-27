import { BrevoClient } from "@getbrevo/brevo";

export const sendEmail = async (
  subject: string = "Hello from Brevo!",
  to: { email: string; name: string }[],
  template: string,
) => {
  try {
    const brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY!,
    });
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: template,
      sender: { name: process.env.NAME_SENDER_EMAIL || "example", email: "duverneyortiz2015@gmail.com" },
      to: to,
    });
    console.log("Este es el resultdo de brevo ", result);
  } catch (error) {
    console.log("Este es el error que genero brevo ", error);
  }
};

export const templeteSendCode = (data: {
  code: string;
  company: string | null;
  user: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verification Code</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:40px 0;">
<tr>
<td align="center">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

    <!-- Header -->
    <tr>
        <td align="center" style="padding:40px;background:linear-gradient(135deg,#2563eb,#4f46e5);">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">
                {{ params.company }}
            </h1>

            <p style="margin-top:12px;color:#dbeafe;font-size:16px;">
                Secure Verification
            </p>
        </td>
    </tr>

    <!-- Content -->
    <tr>
        <td style="padding:45px;">

            <p style="margin:0;font-size:18px;color:#111827;">
                Hello <strong>${data.user}</strong>,
            </p>

            <p style="margin-top:24px;font-size:16px;line-height:28px;color:#4b5563;">
                We received a request to verify your identity.
                Use the verification code below to continue.
            </p>

            <!-- OTP -->
            <table width="100%" cellspacing="0" cellpadding="0" style="margin:35px 0;">
                <tr>
                    <td align="center">

                        <div style="
                            display:inline-block;
                            background:#eff6ff;
                            border:2px dashed #2563eb;
                            border-radius:12px;
                            padding:20px 35px;
                            letter-spacing:10px;
                            font-size:38px;
                            font-weight:bold;
                            color:#2563eb;
                            font-family:Consolas,Monaco,monospace;
                        ">
                            ${data.code}
                        </div>

                    </td>
                </tr>
            </table>

            <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;">
                <tr>
                    <td style="
                        background:#f9fafb;
                        border-left:4px solid #2563eb;
                        border-radius:8px;
                        padding:18px;
                    ">

                        <p style="margin:0;font-size:15px;color:#374151;">
                            ⏱️ This code will expire in
                            <strong>5 minutes</strong>.
                        </p>

                    </td>
                </tr>
            </table>

            <p style="margin-top:35px;font-size:15px;line-height:28px;color:#6b7280;">
                If you didn't request this code, you can safely ignore this email.
                For your security, never share this code with anyone.
            </p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:40px 0;">
            ${
              data.company
                ? ` <p style="margin:0;color:#9ca3af;font-size:14px;">
                Thank you,
            </p>

            <p style="margin-top:6px;font-size:16px;font-weight:bold;color:#111827;">
                ${data.company} Team
            </p>`
                : ""
            }
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center" style="background:#f9fafb;padding:25px;">

            <p style="margin:0;font-size:13px;color:#9ca3af;">
                This is an automated message. Please do not reply.
            </p>

            <p style="margin-top:8px;font-size:12px;color:#d1d5db;">
                © {{ params.company }}. All rights reserved.
            </p>

        </td>
    </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
