"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Copy, CheckCircle, Info } from "lucide-react";

interface EmailTemplatesProps {
  dealerInfo?: {
    contactPerson: string;
    businessName: string;
    email: string;
  };
}

export default function EmailTemplates({ dealerInfo }: EmailTemplatesProps) {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const generateApprovalEmail = (contactPerson: string, businessName: string) => {
    return `Subject: Congratulations! Your Dealer Application has been Approved

Dear ${contactPerson},

Congratulations! We're excited to inform you that your dealer application for ${businessName} has been approved.

You can now access the dealer portal using the credentials you created during signup:

NEXT STEPS:
1. Visit: ${window.location.origin}/dealer-login
2. Log in with your email and password
3. Complete your profile information if needed
4. Start browsing our wholesale catalog

Welcome to the Jeen Mata Impex dealer network! You now have access to:
- Wholesale pricing on all products
- Exclusive dealer-only products
- Priority customer support
- Bulk order capabilities
- Order tracking and management
- Shipment notifications

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
Jeen Mata Impex Team

---
This is an automated message. Please do not reply to this email.`;
  };

  const generateRejectionEmail = (contactPerson: string, businessName: string, reason?: string) => {
    return `Subject: Update on Your Dealer Application

Dear ${contactPerson},

Thank you for your interest in becoming a dealer partner with Jeen Mata Impex.

After careful review, we regret to inform you that we cannot approve your dealer application for ${businessName} at this time.

${reason ? `Reason: ${reason}` : 'This decision was made based on our current partnership requirements and business criteria.'}

We encourage you to:
- Review our dealer requirements on our website
- Consider reapplying in the future when circumstances change
- Contact our support team if you have questions about this decision

We appreciate your interest in partnering with us and wish you success in your business endeavors.

Best regards,
Jeen Mata Impex Team

---
This is an automated message. Please do not reply to this email.`;
  };

  const generateWelcomeEmail = (contactPerson: string, businessName: string) => {
    return `Subject: Welcome to Jeen Mata Impex Dealer Network!

Dear ${contactPerson},

Welcome to the Jeen Mata Impex dealer family! We're thrilled to have ${businessName} as our partner.

Your dealer account is now active and you can start placing orders immediately.

GETTING STARTED:
1. Log in to your dealer portal: ${window.location.origin}/dealer-login
2. Browse our extensive product catalog
3. View wholesale pricing exclusive to dealers
4. Place your first order
5. Track shipments and manage your orders

DEALER BENEFITS:
- Competitive wholesale pricing
- Exclusive dealer-only products
- Priority customer support
- Flexible payment terms
- Fast shipping and delivery
- Dedicated account manager

SUPPORT RESOURCES:
- Dealer Portal: Access your account 24/7
- Product Catalogs: Download latest product information
- Support Team: Contact us for any assistance
- Training Materials: Access dealer resources and guides

We're committed to your success and look forward to a profitable partnership.

Best regards,
Jeen Mata Impex Team

---
For support, contact us at support@jeenmataimpex.com`;
  };

  const copyToClipboard = (text: string, templateName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(templateName);
    setTimeout(() => setCopiedTemplate(null), 3000);
  };

  const defaultContactPerson = dealerInfo?.contactPerson || "[Contact Person Name]";
  const defaultBusinessName = dealerInfo?.businessName || "[Business Name]";

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Templates for Manual Sending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These templates can be copied and pasted into your email client for manual sending. 
            Replace placeholder text with actual dealer information.
          </AlertDescription>
        </Alert>

        {copiedTemplate && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {copiedTemplate} template copied to clipboard!
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="approval" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approval">Approval Email</TabsTrigger>
            <TabsTrigger value="rejection">Rejection Email</TabsTrigger>
            <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approval" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Dealer Application Approval</h3>
              <p className="text-sm text-gray-600">
                Send this email when approving a dealer application. The dealer can login with their existing signup credentials.
              </p>
            </div>
            
            <Textarea
              value={generateApprovalEmail(defaultContactPerson, defaultBusinessName)}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
            
            <Button
              onClick={() => copyToClipboard(
                generateApprovalEmail(defaultContactPerson, defaultBusinessName),
                "Approval email"
              )}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Approval Email Template
            </Button>
          </TabsContent>

          <TabsContent value="rejection" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Dealer Application Rejection</h3>
              <p className="text-sm text-gray-600">
                Send this email when rejecting a dealer application. You can customize the reason for rejection.
              </p>
            </div>
            
            <Textarea
              value={generateRejectionEmail(defaultContactPerson, defaultBusinessName, "Application did not meet our current partnership requirements")}
              readOnly
              className="min-h-[300px] font-mono text-sm"
            />
            
            <Button
              onClick={() => copyToClipboard(
                generateRejectionEmail(defaultContactPerson, defaultBusinessName, "Application did not meet our current partnership requirements"),
                "Rejection email"
              )}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Rejection Email Template
            </Button>
          </TabsContent>

          <TabsContent value="welcome" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Welcome Email</h3>
              <p className="text-sm text-gray-600">
                Send this email as a follow-up welcome message to newly approved dealers.
              </p>
            </div>
            
            <Textarea
              value={generateWelcomeEmail(defaultContactPerson, defaultBusinessName)}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
            
            <Button
              onClick={() => copyToClipboard(
                generateWelcomeEmail(defaultContactPerson, defaultBusinessName),
                "Welcome email"
              )}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Welcome Email Template
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click "Copy" to copy the template to your clipboard</li>
            <li>• Paste into your email client (Gmail, Outlook, etc.)</li>
            <li>• Replace placeholder text with actual dealer information</li>
            <li>• Customize the message as needed</li>
            <li>• Send to the dealer's email address</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
