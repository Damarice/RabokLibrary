/**
 * Email Utility
 * Handles sending emails with templates
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        }
    });
};

// Email templates
const templates = {
    emailVerification: {
        subject: 'Verify Your Raboks Library Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4a4a;">Welcome to Raboks Library R&D Center</h2>
                <p>Dear {{name}},</p>
                <p>Thank you for registering with Raboks Library Research & Development Center. To complete your registration, please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{verificationUrl}}" style="background-color: #4a4a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{{verificationUrl}}</p>
                <p>This verification link will expire in 24 hours.</p>
                <p>If you didn't create an account with us, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    Raboks Library Research & Development Center<br>
                    Advancing knowledge through systematic inquiry
                </p>
            </div>
        `
    },
    
    passwordReset: {
        subject: 'Password Reset Request - Raboks Library',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4a4a;">Password Reset Request</h2>
                <p>Dear {{name}},</p>
                <p>We received a request to reset your password for your Raboks Library account. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{resetUrl}}" style="background-color: #4a4a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
                <p><strong>This password reset link will expire in 10 minutes.</strong></p>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    Raboks Library Research & Development Center<br>
                    Advancing knowledge through systematic inquiry
                </p>
            </div>
        `
    },
    
    reviewInvitation: {
        subject: 'Peer Review Invitation - Raboks Library',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4a4a;">Peer Review Invitation</h2>
                <p>Dear {{reviewerName}},</p>
                <p>You have been invited to review a manuscript submitted to Raboks Library Research & Development Center:</p>
                <div style="background-color: #f5f5f0; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #4a4a4a;">{{manuscriptTitle}}</h3>
                    <p><strong>Authors:</strong> {{authors}}</p>
                    <p><strong>Field:</strong> {{field}}</p>
                    <p><strong>Type:</strong> {{type}}</p>
                    <p><strong>Due Date:</strong> {{dueDate}}</p>
                </div>
                <p>Please log in to your account to accept or decline this review invitation:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{reviewUrl}}" style="background-color: #4a4a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Invitation</a>
                </div>
                <p>Thank you for your contribution to scholarly peer review.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    Raboks Library Research & Development Center<br>
                    Advancing knowledge through systematic inquiry
                </p>
            </div>
        `
    },
    
    statusUpdate: {
        subject: 'Manuscript Status Update - Raboks Library',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4a4a;">Manuscript Status Update</h2>
                <p>Dear {{authorName}},</p>
                <p>The status of your manuscript has been updated:</p>
                <div style="background-color: #f5f5f0; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #4a4a4a;">{{manuscriptTitle}}</h3>
                    <p><strong>Submission ID:</strong> {{submissionId}}</p>
                    <p><strong>New Status:</strong> {{newStatus}}</p>
                    <p><strong>Update Date:</strong> {{updateDate}}</p>
                    {{#if note}}<p><strong>Note:</strong> {{note}}</p>{{/if}}
                </div>
                <p>Please log in to your account to view the full details:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{manuscriptUrl}}" style="background-color: #4a4a4a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Manuscript</a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    Raboks Library Research & Development Center<br>
                    Advancing knowledge through systematic inquiry
                </p>
            </div>
        `
    }
};

/**
 * Send email with template
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        
        // Get template
        const template = templates[options.template];
        if (!template) {
            throw new Error(`Template ${options.template} not found`);
        }
        
        // Replace template variables
        let html = template.html;
        let subject = options.subject || template.subject;
        
        if (options.data) {
            Object.keys(options.data).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, options.data[key] || '');
                subject = subject.replace(regex, options.data[key] || '');
            });
        }
        
        // Send email
        const mailOptions = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: subject,
            html: html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent:', info.messageId);
        return info;
        
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

/**
 * Send bulk emails
 * @param {Array} emails - Array of email options
 */
const sendBulkEmails = async (emails) => {
    const results = [];
    
    for (const emailOptions of emails) {
        try {
            const result = await sendEmail(emailOptions);
            results.push({ success: true, messageId: result.messageId, email: emailOptions.email });
        } catch (error) {
            results.push({ success: false, error: error.message, email: emailOptions.email });
        }
    }
    
    return results;
};

module.exports = {
    sendEmail,
    sendBulkEmails
};