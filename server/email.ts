import { User, Deposit, Withdrawal } from '@shared/schema';

// Simple interface for email parameters
interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Base sender email address
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@stakeplay.com';

// Console-based email service that logs emails instead of sending them
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log('\n========== EMAIL NOTIFICATION ==========');
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log('-------- Content --------');
    console.log(params.text || params.html || '(No content)');
    console.log('======================================\n');
    return true;
  } catch (error) {
    console.error('Error logging email notification:', error);
    return false;
  }
}

// Send welcome email to new users
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  if (!user.email) return false;

  const subject = 'Welcome to StakePlay!';
  const text = `
    Hello ${user.username},

    Welcome to StakePlay - your virtual betting platform!

    Your account has been successfully created. Please make a deposit to start playing our exciting games.

    Best regards,
    The StakePlay Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Welcome to StakePlay!</h2>
      <p>Hello ${user.username},</p>
      <p>Welcome to StakePlay - your virtual betting platform!</p>
      <p>Your account has been successfully created. Please make a deposit to start playing our exciting games.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0;">Best regards,<br>The StakePlay Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

// Send deposit status update email
export async function sendDepositStatusEmail(user: User, deposit: Deposit): Promise<boolean> {
  if (!user.email) return false;

  const statusMap = {
    'pending': 'is pending verification',
    'approved': 'has been approved',
    'rejected': 'has been rejected'
  };

  const subject = `Deposit Update: Your deposit ${statusMap[deposit.status as keyof typeof statusMap]}`;
  const adminNote = deposit.adminNote ? `Admin note: ${deposit.adminNote}` : '';
  
  const text = `
    Hello ${user.username},

    Your deposit of ₹${deposit.amount} ${statusMap[deposit.status as keyof typeof statusMap]}.
    ${deposit.status === 'approved' ? 'The amount has been added to your account balance.' : ''}
    ${adminNote}

    Best regards,
    The StakePlay Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${deposit.status === 'approved' ? '#22c55e' : deposit.status === 'rejected' ? '#ef4444' : '#6366f1'};">
        Deposit Update
      </h2>
      <p>Hello ${user.username},</p>
      <p>Your deposit of ₹${deposit.amount} ${statusMap[deposit.status as keyof typeof statusMap]}.</p>
      ${deposit.status === 'approved' ? '<p>The amount has been added to your account balance.</p>' : ''}
      ${adminNote ? `<p><strong>Admin note:</strong> ${deposit.adminNote}</p>` : ''}
      <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0;">Best regards,<br>The StakePlay Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

// Send withdrawal status update email
export async function sendWithdrawalStatusEmail(user: User, withdrawal: Withdrawal): Promise<boolean> {
  if (!user.email) return false;

  const statusMap = {
    'pending': 'is pending verification',
    'approved': 'has been approved',
    'rejected': 'has been rejected'
  };

  const subject = `Withdrawal Update: Your withdrawal ${statusMap[withdrawal.status as keyof typeof statusMap]}`;
  const adminNote = withdrawal.adminNote ? `Admin note: ${withdrawal.adminNote}` : '';
  
  const text = `
    Hello ${user.username},

    Your withdrawal request of ₹${withdrawal.amount} ${statusMap[withdrawal.status as keyof typeof statusMap]}.
    ${withdrawal.status === 'approved' ? 'The amount has been processed for payment to your specified account.' : ''}
    ${adminNote}

    Best regards,
    The StakePlay Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${withdrawal.status === 'approved' ? '#22c55e' : withdrawal.status === 'rejected' ? '#ef4444' : '#6366f1'};">
        Withdrawal Update
      </h2>
      <p>Hello ${user.username},</p>
      <p>Your withdrawal request of ₹${withdrawal.amount} ${statusMap[withdrawal.status as keyof typeof statusMap]}.</p>
      ${withdrawal.status === 'approved' ? '<p>The amount has been processed for payment to your specified account.</p>' : ''}
      ${adminNote ? `<p><strong>Admin note:</strong> ${withdrawal.adminNote}</p>` : ''}
      <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0;">Best regards,<br>The StakePlay Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}