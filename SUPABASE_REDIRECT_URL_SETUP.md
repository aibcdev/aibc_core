# Supabase Redirect URL Setup for Password Reset

## Where to Add the Redirect URL

The redirect URL `https://aibcmedia.com#reset-password` needs to be added in **Supabase Dashboard**.

### Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Navigate to URL Configuration**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration** (under Settings section)

3. **Add Redirect URLs**
   - Find the **"Redirect URLs"** section
   - Click **"Add URL"** button
   - Add these URLs (one at a time):
     ```
     https://aibcmedia.com
     https://www.aibcmedia.com
     https://aibcmedia.com#reset-password
     https://www.aibcmedia.com#reset-password
     ```

4. **Set Site URL**
   - In the **"Site URL"** field (at the top), set:
     ```
     https://aibcmedia.com
     ```

5. **Save Changes**
   - Click **"Save"** or the save button

## Why This is Needed

When a user clicks the password reset link in their email:
1. Supabase redirects them to your site
2. The redirect URL includes `#reset-password` in the hash
3. Your app reads this hash and shows the password reset form
4. Without this URL in Supabase's allowed list, the redirect will fail

## Visual Guide

```
Supabase Dashboard
├── Authentication
    ├── URL Configuration  ← Go here
        ├── Site URL: https://aibcmedia.com
        └── Redirect URLs:
            ├── https://aibcmedia.com
            ├── https://www.aibcmedia.com
            ├── https://aibcmedia.com#reset-password  ← Add this
            └── https://www.aibcmedia.com#reset-password  ← Add this
```

## Important Notes

- **The hash (`#reset-password`) is important** - it tells your app to show the reset form
- **Add both with and without `www`** - covers both domain variations
- **No trailing slash** - don't add `/` at the end
- **Must match exactly** - including `https://` (not `http://`)

## Alternative: Use Wildcards (Easier)

If Supabase supports wildcards, you can use:
```
https://aibcmedia.com*
https://www.aibcmedia.com*
```

This covers all paths and hashes on your domain.

## Testing

After adding the URLs:
1. Request a password reset
2. Check your email
3. Click the reset link
4. You should be redirected to `https://aibcmedia.com#reset-password`
5. The password reset form should appear

If you get a "redirect_uri_mismatch" error, the URL isn't in the allowed list.


## Where to Add the Redirect URL

The redirect URL `https://aibcmedia.com#reset-password` needs to be added in **Supabase Dashboard**.

### Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Navigate to URL Configuration**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration** (under Settings section)

3. **Add Redirect URLs**
   - Find the **"Redirect URLs"** section
   - Click **"Add URL"** button
   - Add these URLs (one at a time):
     ```
     https://aibcmedia.com
     https://www.aibcmedia.com
     https://aibcmedia.com#reset-password
     https://www.aibcmedia.com#reset-password
     ```

4. **Set Site URL**
   - In the **"Site URL"** field (at the top), set:
     ```
     https://aibcmedia.com
     ```

5. **Save Changes**
   - Click **"Save"** or the save button

## Why This is Needed

When a user clicks the password reset link in their email:
1. Supabase redirects them to your site
2. The redirect URL includes `#reset-password` in the hash
3. Your app reads this hash and shows the password reset form
4. Without this URL in Supabase's allowed list, the redirect will fail

## Visual Guide

```
Supabase Dashboard
├── Authentication
    ├── URL Configuration  ← Go here
        ├── Site URL: https://aibcmedia.com
        └── Redirect URLs:
            ├── https://aibcmedia.com
            ├── https://www.aibcmedia.com
            ├── https://aibcmedia.com#reset-password  ← Add this
            └── https://www.aibcmedia.com#reset-password  ← Add this
```

## Important Notes

- **The hash (`#reset-password`) is important** - it tells your app to show the reset form
- **Add both with and without `www`** - covers both domain variations
- **No trailing slash** - don't add `/` at the end
- **Must match exactly** - including `https://` (not `http://`)

## Alternative: Use Wildcards (Easier)

If Supabase supports wildcards, you can use:
```
https://aibcmedia.com*
https://www.aibcmedia.com*
```

This covers all paths and hashes on your domain.

## Testing

After adding the URLs:
1. Request a password reset
2. Check your email
3. Click the reset link
4. You should be redirected to `https://aibcmedia.com#reset-password`
5. The password reset form should appear

If you get a "redirect_uri_mismatch" error, the URL isn't in the allowed list.












