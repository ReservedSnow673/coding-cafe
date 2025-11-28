import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""
    
    @staticmethod
    def send_otp_email(email: str, otp: str) -> bool:
        """
        Send OTP to user's email
        
        Args:
            email: Recipient email address
            otp: 6-digit OTP code
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'PlakshaConnect - Your OTP Code'
            msg['From'] = settings.SMTP_FROM
            msg['To'] = email
            
            # Create HTML content
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">PlakshaConnect</h1>
                    <p style="color: #666; margin-top: 10px;">Campus Networking Platform</p>
                  </div>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; display: inline-block;">
                      <h2 style="color: #333; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">{otp}</h2>
                    </div>
                  </div>
                  
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                      This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                    </p>
                  </div>
                  
                  <div style="margin-top: 30px; text-align: center;">
                    <p style="color: #999; font-size: 12px;">
                      © 2025 PlakshaConnect. All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            """
            
            # Create plain text alternative
            text = f"""
            PlakshaConnect - Your OTP Code
            
            Your verification code is: {otp}
            
            This code will expire in 10 minutes.
            If you didn't request this code, please ignore this email.
            
            © 2025 PlakshaConnect
            """
            
            # Attach both versions
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"OTP email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(email: str, full_name: str) -> bool:
        """
        Send welcome email to newly registered user
        
        Args:
            email: User's email address
            full_name: User's full name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Welcome to PlakshaConnect!'
            msg['From'] = settings.SMTP_FROM
            msg['To'] = email
            
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h1 style="color: #333; text-align: center;">Welcome to PlakshaConnect! 🎉</h1>
                  
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Hi {full_name},
                  </p>
                  
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    We're excited to have you join our campus community! PlakshaConnect helps you:
                  </p>
                  
                  <ul style="color: #666; font-size: 16px; line-height: 1.8;">
                    <li>Share your location and meet up with friends</li>
                    <li>Join group chats for clubs, hostels, and courses</li>
                    <li>Stay updated with campus announcements</li>
                    <li>Report and track campus issues</li>
                    <li>Find teammates for projects and hackathons</li>
                    <li>Review mess food and participate in challenges</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.CORS_ORIGINS.split(',')[0]}" 
                       style="display: inline-block; padding: 15px 40px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                      Get Started
                    </a>
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2025 PlakshaConnect. All rights reserved.
                  </p>
                </div>
              </body>
            </html>
            """
            
            text = f"""
            Welcome to PlakshaConnect!
            
            Hi {full_name},
            
            We're excited to have you join our campus community!
            
            Visit {settings.CORS_ORIGINS.split(',')[0]} to get started.
            
            © 2025 PlakshaConnect
            """
            
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Welcome email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
