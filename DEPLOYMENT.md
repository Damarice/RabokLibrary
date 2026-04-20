# Deployment Guide for cPanel Hosting with Supabase

## Prerequisites

1. **cPanel hosting account** with Node.js support
2. **Supabase account** (free tier available)
3. **Domain name** for your application

## Step 1: Set up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Wait for the project to be ready (2-3 minutes)

### 1.2 Set up Database Schema
1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire content from `database/schema.sql`
4. Paste it in the SQL Editor and click "Run"
5. This will create all tables, indexes, and sample data

### 1.3 Get Connection Details
1. Go to "Settings" → "Database" in your Supabase dashboard
2. Copy the following:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Database URL**: `postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres`

## Step 2: Prepare Files for Upload

### 2.1 Update Environment Variables
Edit the `.env` file with your actual Supabase credentials:

```env
# Environment Configuration
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (PostgreSQL via Supabase)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# JWT Configuration - CHANGE THIS SECRET!
JWT_SECRET=YourUniqueSecretKey2024!@#$%^&*()
JWT_EXPIRE=7d

# Email Configuration (use your domain's email)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Raboks Library R&D Center

# File Upload
MAX_FILE_SIZE=26214400

# Frontend URL (your actual domain)
FRONTEND_URL=https://yourdomain.com
```

### 2.2 Create Production Package.json
Make sure your `package.json` has the correct main entry:

```json
{
  "main": "app.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

## Step 3: Upload to cPanel

### 3.1 Access File Manager
1. Login to your cPanel
2. Open "File Manager"
3. Navigate to your domain's folder (usually `public_html` or `public_html/yourdomain.com`)

### 3.2 Upload Files
1. Upload all project files EXCEPT:
   - `node_modules/` (will be installed on server)
   - `.git/` (not needed in production)
   - `database/` (schema already applied to Supabase)
   - Any local development files

2. Essential files to upload:
   ```
   ├── config/
   ├── middleware/
   ├── models/supabase/
   ├── routes/
   ├── scripts/
   ├── utils/
   ├── uploads/ (empty directories)
   ├── app.js
   ├── server.js
   ├── package.json
   ├── .env
   └── README files
   ```

### 3.3 Set File Permissions
1. Select all uploaded files
2. Right-click → "Change Permissions"
3. Set folders to `755` and files to `644`
4. Make sure `uploads/` folder and subfolders are writable (`755`)

## Step 4: Configure Node.js in cPanel

### 4.1 Create Node.js App
1. In cPanel, find "Node.js App" or "Node.js Selector"
2. Click "Create Application"
3. Fill in:
   - **Node.js Version**: Latest LTS (18.x or 20.x)
   - **Application Mode**: Production
   - **Application Root**: Your domain folder
   - **Application URL**: Your domain
   - **Application Startup File**: `app.js`

### 4.2 Install Dependencies
1. After creating the app, click "Run NPM Install"
2. Wait for installation to complete
3. If it fails, try using the terminal:
   ```bash
   cd /home/yourusername/public_html/yourdomain.com
   npm install --production
   ```

### 4.3 Set Environment Variables
1. In the Node.js App interface, find "Environment Variables"
2. Add each variable from your `.env` file:
   - `NODE_ENV=production`
   - `SUPABASE_URL=your-supabase-url`
   - `SUPABASE_ANON_KEY=your-anon-key`
   - etc.

## Step 5: Configure Domain and SSL

### 5.1 Point Domain to Node.js App
1. In cPanel, go to "Subdomains" or "Addon Domains"
2. Make sure your domain points to the correct folder
3. The Node.js app should automatically handle requests

### 5.2 Enable SSL
1. In cPanel, go to "SSL/TLS"
2. Enable "Let's Encrypt" for your domain
3. Force HTTPS redirects

## Step 6: Test Your Application

### 6.1 Check Application Status
1. In cPanel Node.js App, click "Restart"
2. Check if the app is "Running"
3. Look for any error messages

### 6.2 Test API Endpoints
Visit these URLs to test:
- `https://yourdomain.com/api/health` - Should return health status
- `https://yourdomain.com/api/publications` - Should return empty array initially

### 6.3 Test Frontend Integration
1. Upload your frontend files to the same domain or subdomain
2. Update frontend API URLs to point to your domain
3. Test user registration and login

## Step 7: Monitor and Maintain

### 7.1 View Logs
1. In cPanel Node.js App, check "Error Logs" and "Access Logs"
2. Monitor for any issues or errors

### 7.2 Database Management
1. Use Supabase dashboard to:
   - View data in tables
   - Monitor database performance
   - Set up backups
   - Manage user access

### 7.3 File Uploads
1. Monitor the `uploads/` folder size
2. Set up regular cleanup if needed
3. Consider using Supabase Storage for large files

## Troubleshooting

### Common Issues:

1. **App won't start**:
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Check error logs for specific issues

2. **Database connection fails**:
   - Verify Supabase credentials
   - Check if Supabase project is active
   - Test connection from Supabase dashboard

3. **File upload issues**:
   - Check folder permissions (755 for uploads/)
   - Verify MAX_FILE_SIZE setting
   - Check available disk space

4. **Email not working**:
   - Verify SMTP settings with your hosting provider
   - Test email configuration
   - Check spam folders

### Support Resources:
- Supabase Documentation: https://supabase.com/docs
- cPanel Documentation: Your hosting provider's help section
- Node.js Hosting: Contact your hosting provider's support

## Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Set strong database password
- [ ] Enabled SSL/HTTPS
- [ ] Set proper file permissions
- [ ] Configured CORS for your domain only
- [ ] Set up regular database backups
- [ ] Monitor error logs regularly

## Performance Optimization

1. **Enable compression** (already configured in server.js)
2. **Set up CDN** for static files
3. **Monitor database queries** in Supabase dashboard
4. **Set up caching** if needed
5. **Regular cleanup** of uploaded files

Your Raboks Library backend is now ready for production use with Supabase!