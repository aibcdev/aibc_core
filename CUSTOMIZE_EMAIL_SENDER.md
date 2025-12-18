# Customize Email Sender - Make It Professional

## Current Issue
Password reset emails show:
- **From:** "Supabase Auth" <noreply@mail.app.supabase.io>
- **Not professional** - shows Supabase branding

## Solution: Customize Email Settings

### Option 1: Customize Sender Name (Quick Fix - No SMTP)

**This changes the sender name but still uses Supabase's email address.**

1. **Go to Supabase Dashboard**
   - Authentication → Email Templates
   - Click "Reset password"

2. **Customize the email content:**
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```

3. **Set custom sender name:**
   - In Supabase Dashboard → Authentication → Email
   - Look for "Sender email" or "From email" setting
   - Or check Settings → General → Email settings

**Note:** Without custom SMTP, you can't change the email address, only the name/content.

### Option 2: Custom SMTP with Your Domain (Best Solution)

**This gives you full control:**
- Custom email address: `noreply@aibcmedia.com`
- Custom sender name: "AIBC"
- Professional appearance

#### Step 1: Set Up SendGrid (Recommended)

1. **Create SendGrid account** (free tier: 100 emails/day)
   - Go to https://sendgrid.com
   - Sign up for free account

2. **Verify your domain** (for `@aibcmedia.com` emails)
   - SendGrid Dashboard → Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow instructions to add DNS records
   - This allows you to send from `noreply@aibcmedia.com`

3. **Create API Key**
   - SendGrid Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name it "Supabase"
   - Give it "Mail Send" permissions
   - Copy the API key (you won't see it again!)

#### Step 2: Configure in Supabase

1. **Go to Supabase Dashboard**
   - Authentication → Email → SMTP Settings
   - Click "Set up SMTP" or "Configure SMTP"

2. **Enter SendGrid settings:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@aibcmedia.com
   Sender name: AIBC
   ```

3. **Save settings**

#### Step 3: Update Email Template

1. **Go to:** Authentication → Email Templates → Reset password
2. **Update template:**
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}" style="background-color: #FF5E1E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```

3. **Save changes**

### Option 3: Use Your Existing Email Provider

If you have another email provider (Gmail, Outlook, etc.):

1. **Get SMTP credentials** from your provider
2. **Enter in Supabase:**
   - Authentication → Email → SMTP Settings
   - Use your provider's SMTP settings
   - Set sender email to your domain email

## Quick Fix (No SMTP Setup)

**At minimum, update the email template to remove Supabase branding:**

1. Go to: Authentication → Email Templates → Reset password
2. Replace content with:
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```
3. Save changes

**This won't change the sender email address, but it will make the email content look professional.**

## Recommended: Set Up SendGrid

For a fully professional setup:
1. ✅ Custom email: `noreply@aibcmedia.com`
2. ✅ Custom sender name: "AIBC"
3. ✅ Professional branding
4. ✅ Better deliverability
5. ✅ No rate limits (on paid plans)

**Time to set up:** ~15 minutes

## Testing

After setting up:
1. Request password reset
2. Check email
3. Should see:
   - **From:** "AIBC" <noreply@aibcmedia.com> (with SMTP)
   - **From:** "Supabase Auth" <noreply@mail.app.supabase.io> (without SMTP, but custom content)


## Current Issue
Password reset emails show:
- **From:** "Supabase Auth" <noreply@mail.app.supabase.io>
- **Not professional** - shows Supabase branding

## Solution: Customize Email Settings

### Option 1: Customize Sender Name (Quick Fix - No SMTP)

**This changes the sender name but still uses Supabase's email address.**

1. **Go to Supabase Dashboard**
   - Authentication → Email Templates
   - Click "Reset password"

2. **Customize the email content:**
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```

3. **Set custom sender name:**
   - In Supabase Dashboard → Authentication → Email
   - Look for "Sender email" or "From email" setting
   - Or check Settings → General → Email settings

**Note:** Without custom SMTP, you can't change the email address, only the name/content.

### Option 2: Custom SMTP with Your Domain (Best Solution)

**This gives you full control:**
- Custom email address: `noreply@aibcmedia.com`
- Custom sender name: "AIBC"
- Professional appearance

#### Step 1: Set Up SendGrid (Recommended)

1. **Create SendGrid account** (free tier: 100 emails/day)
   - Go to https://sendgrid.com
   - Sign up for free account

2. **Verify your domain** (for `@aibcmedia.com` emails)
   - SendGrid Dashboard → Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow instructions to add DNS records
   - This allows you to send from `noreply@aibcmedia.com`

3. **Create API Key**
   - SendGrid Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name it "Supabase"
   - Give it "Mail Send" permissions
   - Copy the API key (you won't see it again!)

#### Step 2: Configure in Supabase

1. **Go to Supabase Dashboard**
   - Authentication → Email → SMTP Settings
   - Click "Set up SMTP" or "Configure SMTP"

2. **Enter SendGrid settings:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@aibcmedia.com
   Sender name: AIBC
   ```

3. **Save settings**

#### Step 3: Update Email Template

1. **Go to:** Authentication → Email Templates → Reset password
2. **Update template:**
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}" style="background-color: #FF5E1E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```

3. **Save changes**

### Option 3: Use Your Existing Email Provider

If you have another email provider (Gmail, Outlook, etc.):

1. **Get SMTP credentials** from your provider
2. **Enter in Supabase:**
   - Authentication → Email → SMTP Settings
   - Use your provider's SMTP settings
   - Set sender email to your domain email

## Quick Fix (No SMTP Setup)

**At minimum, update the email template to remove Supabase branding:**

1. Go to: Authentication → Email Templates → Reset password
2. Replace content with:
   ```html
   <h2>Reset Your Password</h2>
   
   <p>Hello,</p>
   
   <p>We received a request to reset your password for your AIBC account. Click the link below to create a new password:</p>
   
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   
   <p>This link will expire in 1 hour.</p>
   
   <p>If you didn't request this, you can safely ignore this email.</p>
   
   <p>Best regards,<br>The AIBC Team</p>
   ```
3. Save changes

**This won't change the sender email address, but it will make the email content look professional.**

## Recommended: Set Up SendGrid

For a fully professional setup:
1. ✅ Custom email: `noreply@aibcmedia.com`
2. ✅ Custom sender name: "AIBC"
3. ✅ Professional branding
4. ✅ Better deliverability
5. ✅ No rate limits (on paid plans)

**Time to set up:** ~15 minutes

## Testing

After setting up:
1. Request password reset
2. Check email
3. Should see:
   - **From:** "AIBC" <noreply@aibcmedia.com> (with SMTP)
   - **From:** "Supabase Auth" <noreply@mail.app.supabase.io> (without SMTP, but custom content)








