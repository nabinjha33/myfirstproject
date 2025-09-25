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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [users, apps] = await Promise.all([
        User.list('-created_date'),
        DealerApplication.list('-created_date')
      ]);
      
      // Filter users to show only those with dealer_status set and not 'Rejected'
      setDealers(users.filter((u: any) => u.dealer_status && u.dealer_status !== 'Rejected')); 
      setApplications(apps);
      
      console.log('Dealers found:', users.filter((u: any) => u.dealer_status && u.dealer_status !== 'Rejected').length);
      console.log('Applications found:', apps.length);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
        // Create user account from application
        const userData = {
          email: app.email,
          full_name: app.contact_person,
          business_name: app.business_name,
          vat_pan: app.vat_pan,
          address: app.address,
          phone: app.phone,
          whatsapp: app.whatsapp,
          dealer_status: 'Approved',
          role: 'user'
        };
        
        await User.create(userData);
        await DealerApplication.update(appId, { status: 'Approved' });
        
        setActionStatus('✅ Application approved and user account created');
      } else {
        await DealerApplication.update(appId, { status: 'Rejected' });
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
    Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    Approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    Rejected: { icon: XCircle, color: 'bg-red-100 text-red-800' },
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
    return matchesSearch && app.status === 'Pending';
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
                  {['All', 'Pending', 'Approved'].map(status => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
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
                      const statusInfo = statusConfig[dealer.dealer_status as keyof typeof statusConfig] || statusConfig.Pending;
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={dealer.id}>
                          <TableCell className="font-medium">{dealer.business_name || 'N/A'}</TableCell>
                          <TableCell>{dealer.full_name}</TableCell>
                          <TableCell>{dealer.email}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {dealer.dealer_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetailDialog(dealer)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {dealer.dealer_status === 'Pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50" 
                                    onClick={() => handleStatusChange(dealer.id, 'Approved')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-600 hover:bg-red-50" 
                                    onClick={() => handleStatusChange(dealer.id, 'Rejected')}
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
                          {app.created_date ? format(new Date(app.created_date), 'MMM d, yyyy') : 'N/A'}
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
