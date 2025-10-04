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
  MapPin,
  FileText,
  RefreshCw
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
import DealerInvitationForm from '@/components/admin/DealerInvitationForm';

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
  const [approvedCredentials, setApprovedCredentials] = useState<{email: string, password: string, businessName: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users and applications separately with better error handling
      const [users, apps] = await Promise.all([
        User.list('-created_date').catch(err => {
          console.error('Error fetching users:', err);
          return [];
        }),
        DealerApplication.list('-created_date').catch(err => {
          console.error('Error fetching applications:', err);
          return [];
        })
      ]);
      
      // Filter users to show only dealers (those with dealer_status and role = 'dealer')
      const dealerUsers = users.filter((u: any) => 
        u.role === 'dealer' && 
        u.dealer_status && 
        u.dealer_status !== 'rejected'
      ); 
      
      // Filter applications to show only pending ones
      const pendingApps = apps.filter((app: any) => app.status === 'pending');
      
      setDealers(dealerUsers);
      setApplications(pendingApps);
      
      console.log('Dealers found:', dealerUsers.length);
      console.log('Pending applications found:', pendingApps.length);
      console.log('Total applications found:', apps.length);
      
      if (dealerUsers.length === 0 && apps.length === 0) {
        setActionStatus('ℹ️ No dealer data found. This might be expected if no dealers have been created yet.');
        setTimeout(() => setActionStatus(null), 5000);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setActionStatus(`❌ Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setActionStatus(null), 8000);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (dealerId: string, newStatus: string) => {
    try {
      setActionStatus(`Updating status to ${newStatus}...`);
      
      const result = await User.update(dealerId, { dealer_status: newStatus });
      
      if (result) {
        setActionStatus(`✅ Status updated to ${newStatus}`);
        // Refresh data to show updated status
        await fetchData();
      } else {
        throw new Error('Update returned no result');
      }
      
      setTimeout(() => setActionStatus(null), 3000);
    } catch (error: any) {
      console.error('Error updating dealer status:', error);
      setActionStatus(`❌ Failed to update status: ${error.message || 'Unknown error'}`);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  const handleApplicationAction = async (appId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setActionStatus(`${action === 'approve' ? 'Approving' : 'Rejecting'} application...`);
      
      const app = applications.find(a => a.id === appId);
      if (!app) return;

      if (action === 'approve') {
        // Call our new approval API
        const response = await fetch('/api/admin/approve-dealer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: appId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to approve dealer');
        }

        const result = await response.json();
        setActionStatus(`✅ Dealer approved! Credentials sent via email automatically.`);
        
        // Store credentials for display
        setApprovedCredentials({
          email: result.credentials.email,
          password: result.credentials.password,
          businessName: result.credentials.businessName
        });
      } else {
        // Call rejection API
        const response = await fetch('/api/admin/reject-dealer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: appId,
            reason: reason || 'Application did not meet our requirements'
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to reject application');
        }

        setActionStatus('❌ Application rejected. Rejection email sent automatically.');
      }
      
      // Refresh data
      await fetchData();
      setTimeout(() => setActionStatus(null), 5000);
      
    } catch (error: any) {
      console.error('Error processing application:', error);
      setActionStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  const showDetails = (item: any) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800' },
  };

  const filteredDealers = dealers.filter((dealer: any) => {
    if (!dealer) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      dealer.business_name?.toLowerCase().includes(searchLower) ||
      dealer.full_name?.toLowerCase().includes(searchLower) ||
      dealer.email?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || dealer.dealer_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((app: any) => {
    if (!app) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      app.business_name?.toLowerCase().includes(searchLower) ||
      app.contact_person?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower);
    
    // Only show pending applications in the applications tab
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dealer Management</h1>
            <p className="text-gray-600 mt-2">
              Manage dealer applications and existing dealer accounts
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
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
                Dealer Approval Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="font-medium text-gray-700 mb-2">✅ Dealer Approved Successfully!</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Business:</strong> {approvedCredentials.businessName}</div>
                    <div><strong>Email:</strong> {approvedCredentials.email}</div>
                    <div><strong>Temporary Password:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{approvedCredentials.password}</span></div>
                  </div>
                  <div className="mt-3 text-sm text-green-700">
                    📧 Approval email with login credentials has been sent automatically.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApprovedCredentials(null)}
                    className="text-gray-600"
                  >
                    ✕ Close
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
                    📋 Copy Credentials
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
            <TabsTrigger value="invite">Invite New Dealer</TabsTrigger>
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
                    {filteredDealers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {dealers.length === 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <UserIcon className="h-12 w-12 text-gray-300" />
                              <p>No dealers found</p>
                              <p className="text-sm">Dealers will appear here once applications are approved</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-gray-300" />
                              <p>No dealers match your search</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDealers.map((dealer: any) => {
                        const StatusIcon = statusConfig[dealer.dealer_status as keyof typeof statusConfig]?.icon || Clock;
                        return (
                          <TableRow key={dealer.id}>
                            <TableCell className="font-medium">{dealer.business_name || 'N/A'}</TableCell>
                            <TableCell>{dealer.full_name}</TableCell>
                            <TableCell>{dealer.email}</TableCell>
                            <TableCell>
                              <Badge className={statusConfig[dealer.dealer_status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {dealer.dealer_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => showDetails(dealer)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {dealer.dealer_status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50" 
                                    onClick={() => handleStatusChange(dealer.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
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
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {applications.length === 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-12 w-12 text-gray-300" />
                              <p>No pending applications</p>
                              <p className="text-sm">New dealer applications will appear here for review</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-gray-300" />
                              <p>No applications match your search</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app: any) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.business_name}</TableCell>
                          <TableCell>{app.contact_person}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>
                            {app.created_date ? format(new Date(app.created_date), 'MMM dd, yyyy') : 
                             app.created_at ? format(new Date(app.created_at), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => showDetails(app)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite">
            <Card>
              <CardHeader>
                <CardTitle>Invite New Dealer</CardTitle>
              </CardHeader>
              <CardContent>
                <DealerInvitationForm onSuccess={fetchData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem?.business_name || selectedItem?.full_name || 'Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Business Name</div>
                      <div className="font-medium">{selectedItem.business_name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Contact Person</div>
                      <div className="font-medium">{selectedItem.contact_person || selectedItem.full_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{selectedItem.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{selectedItem.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                {selectedItem.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{selectedItem.address}</div>
                    </div>
                  </div>
                )}
                {selectedItem.message && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">{selectedItem.message}</div>
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
