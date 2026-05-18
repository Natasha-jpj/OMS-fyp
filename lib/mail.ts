import nodemailer from "nodemailer";

// ─── TRANSPORTER SETUP ─────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

// ─── SEND LEAVE APPROVAL EMAIL ────────────────────────────────
export async function sendLeaveApprovalEmail(
  employeeName: string,
  employeeEmail: string,
  departmentName: string,
  leaveTitle: string,
  startDate: string,
  endDate: string
) {
  try {
    const transport = getTransporter();
    
    const startFormatted = new Date(startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const endFormatted = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
      to: employeeEmail,
      subject: `Leave Request Approved - ${leaveTitle}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Leave Request Approved</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your leave has been approved by HR</p>
          </div>

          <div style="background: #f8f8f8; padding: 30px; margin: 20px 0; border-radius: 12px; border-left: 4px solid #10b981;">
            <h2 style="margin: 0 0 20px 0; color: #000;">Leave Details</h2>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Employee Name</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${employeeName}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Department</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${departmentName}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Leave Type</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${leaveTitle}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Duration</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">
                ${startFormatted} → ${endFormatted}
              </p>
            </div>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold; font-size: 16px;">✓ Status: APPROVED</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Plan your work accordingly for the leave period</li>
              <li>Inform your manager about the handover</li>
              <li>Ensure all tasks are completed before your leave</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
            <p>This is an automated email from AuraFlow HR System. Please do not reply to this email.</p>
            <p style="margin: 5px 0 0 0;">© 2025 AuraFlow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("Leave approval email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send leave approval email:", error);
    return false;
  }
}

// ─── SEND LEAVE REJECTION EMAIL ────────────────────────────────
export async function sendLeaveRejectionEmail(
  employeeName: string,
  employeeEmail: string,
  departmentName: string,
  leaveTitle: string,
  startDate: string,
  endDate: string,
  reason?: string
) {
  try {
    const transport = getTransporter();
    
    const startFormatted = new Date(startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const endFormatted = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
      to: employeeEmail,
      subject: `Leave Request Rejected - ${leaveTitle}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Leave Request Rejected</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Unfortunately, your leave has not been approved</p>
          </div>

          <div style="background: #f8f8f8; padding: 30px; margin: 20px 0; border-radius: 12px; border-left: 4px solid #dc2626;">
            <h2 style="margin: 0 0 20px 0; color: #000;">Leave Details</h2>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Employee Name</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${employeeName}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Department</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${departmentName}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Leave Type</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${leaveTitle}</p>
            </div>

            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Requested Dates</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">
                ${startFormatted} → ${endFormatted}
              </p>
            </div>

            ${reason ? `
            <div style="margin-bottom: 15px;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Reason</p>
              <p style="margin: 0; font-size: 14px; color: #333;">${reason}</p>
            </div>
            ` : ""}

            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; color: #991b1b; font-weight: bold; font-size: 16px;">✗ Status: REJECTED</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Next Steps</h3>
            <p style="margin: 0 0 10px 0; color: #666;">You can:</p>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Review the rejection reason above</li>
              <li>Contact your HR for clarification</li>
              <li>Submit a new leave request for different dates</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
            <p>This is an automated email from AuraFlow HR System. Please do not reply to this email.</p>
            <p style="margin: 5px 0 0 0;">© 2025 AuraFlow. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("Leave rejection email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send leave rejection email:", error);
    return false;
  }
}

// ─── SEND NEW USER CREDENTIALS EMAIL ─────────────────────────
export async function sendNewUserCredentials(
  employeeName: string,
  employeeEmail: string,
  username: string,
  password: string
) {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
      to: employeeEmail,
      subject: `Welcome to ${process.env.MAIL_FROM_NAME || 'AuraFlow'} — Your Account Credentials`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to ${process.env.MAIL_FROM_NAME || 'AuraFlow'}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created by HR.</p>
          </div>

          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-radius: 12px;">
            <p style="margin: 0 0 10px 0; color: #666;">Hello <strong>${employeeName}</strong>,</p>
            <p style="margin: 0 0 10px 0; color: #666;">An account has been created for you. Use the credentials below to sign in and complete your profile.</p>

            <div style="margin-top: 16px; padding: 12px; background: white; border: 1px solid #e6e6e6; border-radius: 8px;">
              <p style="margin: 0 0 6px 0; color: #444;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 0; color: #444;"><strong>Password:</strong> ${password}</p>
            </div>

            <p style="margin: 16px 0 0 0; color: #666;">For security, please change your password after your first login.</p>
            <p style="margin: 8px 0 0 0; color: #666;">If you did not expect this email, contact your HR administrator.</p>
          </div>

          <div style="text-align: center; padding: 12px 0; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
            <p>This is an automated email from ${process.env.MAIL_FROM_NAME || 'AuraFlow'} HR System.</p>
          </div>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("New user credentials email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send new user credentials email:", error);
    return false;
  }
}
