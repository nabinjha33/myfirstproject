"use client";

import React, { useState, useEffect } from 'react';
import { User, DealerApplication } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Mail,
  Phone,
  Building,
  User as UserIcon,
  MapPin
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

export default function AdminDealers() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('manage');
  const [tempPassword, setTempPassword] = useState('');
  const [approvedCredentials, setApprovedCredentials] = useState<{email: string, password: string, businessName: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [users, apps] = await Promise.all([
        User.list('-created_at'),
        DealerApplication.list('-created_at')
      ]);
      
      // Filter users to show only those with dealer_status set and not 'rejected'
      const dealerUsers = users.filter((u: any) => u.dealer_status && u.dealer_status !== 'rejected'); 
      setDealers(dealerUsers);
      setApplications(apps);
      
      console.log('Dealers found:', dealerUsers.length);
      console.log('Applications found:', apps.length);
      console.log('Raw users data:', users.slice(0, 2)); // Log first 2 users for debugging
      console.log('Raw applications data:', apps.slice(0, 2)); // Log first 2 applications for debugging
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setActionStatus(`❌ Failed to load data. Please check console for details.`);
      setTimeout(() => setActionStatus(null), 5000);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (dealerId: string, newStatus: string) => {
    try {
      setActionStatus(`Updating status to ${newStatus}...`);
      await User.update(dealerId, { dealer_status: newStatus });
      
      // Send notification if approved
      if (newStatus === 'Approved') {
        setActionStatus('Sending welcome notification...');
        // Here you would integrate with NotificationService
        // await notificationService.sendDealerWelcome(dealer);
      }
      
      setActionStatus(`✅ Status updated to ${newStatus}`);
      setTimeout(() => setActionStatus(null), 3000);
      fetchData();
    } catch (error) {
      setActionStatus('❌ Failed to update status');
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleApplicationAction = async (appId: string, action: 'approve' | 'reject') => {
    try {
      setActionStatus(`${action === 'approve' ? 'Approving' : 'Rejecting'} application...`);
      
      const app = applications.find(a => a.id === appId);
      if (!app) return;

      if (action === 'approve') {
        // Generate a temporary password if not provided
        const password = tempPassword || `Dealer${Math.random().toString(36).slice(-8)}`;
        
        // Call our approval API
        const response = await fetch('/api/dealers/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: appId,
            tempPassword: password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to approve dealer');
        }

        const result = await response.json();
        setActionStatus(`✅ Dealer approved! Check email template below.`);
        
        // Store credentials for email template
        setApprovedCredentials({
          email: result.email,
          password: password,
          businessName: app.business_name
        });
        
        // Clear temp password
        setTempPassword('');
      } else {
        // Reject application
        await DealerApplication.update(appId, { status: 'rejected' });
        setActionStatus('✅ Application rejected');
      }
      
      setTimeout(() => setActionStatus(null), 3000);
      fetchData();
    } catch (error) {
      setActionStatus('❌ Failed to process application');
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const openDetailDialog = (item: any) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800' },
  };

  const filteredDealers = dealers.filter((dealer: any) => {
    const matchesSearch = dealer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || dealer.dealer_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = app.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && app.status === 'pending';
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dealer Management</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search dealers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {actionStatus && (
          <Alert className="mb-6">
            <AlertDescription>{actionStatus}</AlertDescription>
          </Alert>
        )}

        {/* Email Template Section */}
        {approvedCredentials && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Dealer Approval Email Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-green-800">Ready to Copy & Send:</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      const emailContent = `Subject: Welcome to Jeen Mata Impex - Your Dealer Account is Approved!

Dear ${approvedCredentials.businessName} Team,

Congratulations! Your dealer application has been approved. Welcome to the Jeen Mata Impex dealer network!

Your login credentials are:
• Email: ${approvedCredentials.email}
• Password: ${approvedCredentials.password}

You can now access your dealer portal at: ${window.location.origin}/dealer-login

What you can do with your dealer account:
✓ Browse our complete product catalog
✓ Submit orders and inquiries
✓ Track shipment status
✓ Manage your business profile
✓ Access exclusive dealer resources

Important Notes:
• Please change your password after first login for security
• Keep your login credentials secure
• Contact us if you need any assistance

We look forward to a successful partnership!

Best regards,
Jeen Mata Impex Team
Email: jeenmataimpex8@gmail.com
Phone: +977-1-XXXXXXX`;
                      navigator.clipboard.writeText(emailContent);
                      setActionStatus('📧 Email template copied to clipboard!');
                      setTimeout(() => setActionStatus(null), 3000);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    📧 Copy Email Template
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200 text-sm">
                  <div className="font-medium text-gray-700 mb-2">Email Preview:</div>
                  <div className="whitespace-pre-line text-gray-600">
                    <strong>Subject:</strong> Welcome to Jeen Mata Impex - Your Dealer Account is Approved!
                    <br /><br />
                    <strong>Dear {approvedCredentials.businessName} Team,</strong>
                    <br /><br />
                    Congratulations! Your dealer application has been approved. Welcome to the Jeen Mata Impex dealer network!
                    <br /><br />
                    <strong>Your login credentials are:</strong>
                    <br />• Email: <span className="font-mono bg-gray-100 px-1 rounded">{approvedCredentials.email}</span>
                    <br />• Password: <span className="font-mono bg-gray-100 px-1 rounded">{approvedCredentials.password}</span>
                    <br /><br />
                    You can now access your dealer portal at: <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.origin : ''}/dealer-login</span>
                    <br /><br />
                    <strong>What you can do with your dealer account:</strong>
                    <br />✓ Browse our complete product catalog
                    <br />✓ Submit orders and inquiries
                    <br />✓ Track shipment status
                    <br />✓ Manage your business profile
                    <br />✓ Access exclusive dealer resources
                    <br /><br />
                    <strong>Important Notes:</strong>
                    <br />• Please change your password after first login for security
                    <br />• Keep your login credentials secure
                    <br />• Contact us if you need any assistance
                    <br /><br />
                    We look forward to a successful partnership!
                    <br /><br />
                    <strong>Best regards,</strong>
                    <br />Jeen Mata Impex Team
                    <br />Email: jeenmataimpex8@gmail.com
                    <br />Phone: +977-1-XXXXXXX
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApprovedCredentials(null)}
                    className="text-gray-600"
                  >
                    ✕ Close Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const credentials = `Login Credentials:\nEmail: ${approvedCredentials.email}\nPassword: ${approvedCredentials.password}`;
                      navigator.clipboard.writeText(credentials);
                      setActionStatus('📋 Credentials copied to clipboard!');
                      setTimeout(() => setActionStatus(null), 3000);
                    }}
                    className="text-blue-600 border-blue-200"
                  >
                    📋 Copy Credentials Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="manage">Manage Dealers ({dealers.length})</TabsTrigger>
            <TabsTrigger value="applications">
              Pending Applications ({filteredApplications.length})
              {filteredApplications.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{filteredApplications.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Active Dealers</CardTitle>
                <div className="flex gap-2">
                  {['All', 'pending', 'approved'].map(status => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDealers.map((dealer: any) => {
                      const statusInfo = statusConfig[dealer.dealer_status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={dealer.id}>
                          <TableCell className="font-medium">{dealer.business_name || 'N/A'}</TableCell>
                          <TableCell>{dealer.full_name}</TableCell>
                          <TableCell>{dealer.email}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {dealer.dealer_status?.charAt(0).toUpperCase() + dealer.dealer_status?.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetailDialog(dealer)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {dealer.dealer_status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50" 
                                    onClick={() => handleStatusChange(dealer.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-600 hover:bg-red-50" 
                                    onClick={() => handleStatusChange(dealer.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label htmlFor="tempPassword" className="text-sm font-medium text-gray-700">
                      Temporary Password (optional - will auto-generate if empty)
                    </label>
                    <Input
                      id="tempPassword"
                      type="text"
                      placeholder="e.g., DealerPass123"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.business_name}</TableCell>
                        <TableCell>{app.contact_person}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          {app.created_at ? format(new Date(app.created_at), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDetailDialog(app)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-600 hover:bg-green-50" 
                              onClick={() => handleApplicationAction(app.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50" 
                              onClick={() => handleApplicationAction(app.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem?.business_name ? 'Business Details' : 'Application Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Business Name</p>
                        <p className="font-medium">{selectedItem.business_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="font-medium">{selectedItem.contact_person || selectedItem.full_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedItem.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedItem.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="font-medium">{selectedItem.whatsapp || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedItem.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedItem.vat_pan && (
                  <div>
                    <p className="text-sm text-gray-500">VAT/PAN Number</p>
                    <p className="font-medium">{selectedItem.vat_pan}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
