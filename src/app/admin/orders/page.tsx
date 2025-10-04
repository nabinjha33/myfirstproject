"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Order, User } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle, Eye, Package, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import DealerInfoSection from '@/components/admin/DealerInfoSection';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user: adminUser } = useAdminAuth();

  const applyFilters = useCallback(() => {
    let filtered = [...orders];
    if (statusFilter !== 'All') {
      filtered = filtered.filter((order: any) => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orderData = await Order.list('-created_at');
      
      // Process orders to handle different data formats
      const processedOrders = orderData.map((order: any) => {
        let product_items = order.product_items || order.items;
        
        // Handle case where product_items is stored as JSON string
        if (typeof product_items === 'string') {
          try {
            product_items = JSON.parse(product_items);
          } catch (e) {
            console.warn('Failed to parse product_items for order:', order.id);
            product_items = [];
          }
        }
        
        // Handle case where product_items is stored in product_details
        if (!product_items && order.product_details) {
          try {
            product_items = JSON.parse(order.product_details);
          } catch (e) {
            console.warn('Failed to parse product_details for order:', order.id);
            product_items = [];
          }
        }
        
        return {
          ...order,
          product_items: Array.isArray(product_items) ? product_items : [],
          total_amount_npr: order.total_amount_npr || order.estimated_total_value || 0
        };
      });
      
      const activeOrders = processedOrders.filter((o: any) => o.status !== 'Archived');
      setOrders(activeOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    }
    setIsLoading(false);
  };
  
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await Order.update(orderId, { status: newStatus });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleAction = (orderId: string, newStatus: string) => {
    const confirmationText: { [key: string]: string } = {
      Delivered: "Are you sure you want to mark this order as complete?",
      Archived: "Are you sure you want to archive this order? It will be hidden from the main list."
    };

    if (window.confirm(confirmationText[newStatus])) {
      handleStatusChange(orderId, newStatus);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-blue-100 text-blue-800 border-blue-200',
      'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Archived': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const generatePrintableSlip = async (order: any) => {
    const allUsers = await User.list();
    const dealers = allUsers.filter((user: any) => user.email === order.dealer_email);
    const dealer = dealers.length > 0 ? dealers[0] : null;

    const slipHTML = `
      <html>
        <head>
          <title>Order Slip - ${order.order_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; }
            .slip-container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
            h1, h2, h3 { color: #dc2626; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f3f4f6; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #dc2626; }
            .total { text-align: right; margin-top: 20px; font-size: 1.5em; font-weight: bold; }
            .item-notes { font-size: 0.8em; color: #555; }
            @media print {
              body { padding: 0; }
              .slip-container { border: none; box-shadow: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="slip-container">
            <div class="header">
              <div>
                <h1>Order Slip</h1>
                <p><strong>Order #:</strong> ${order.order_number}</p>
                <p><strong>Date:</strong> ${order.created_at || order.created_date ? format(new Date(order.created_at || order.created_date), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
              <div>
                <h2>Jeen Mata Impex</h2>
              </div>
            </div>
            
            <h3 style="margin-top: 30px;">Dealer Information</h3>
            ${dealer ? `
              <p><strong>Business:</strong> ${dealer.business_name || 'N/A'}</p>
              <p><strong>Contact:</strong> ${dealer.full_name || 'N/A'}</p>
              <p><strong>Email:</strong> ${dealer.email}</p>
              <p><strong>Address:</strong> ${dealer.address || 'N/A'}</p>
            ` : `<p><strong>Email:</strong> ${order.dealer_email}</p>`}

            <h3 style="margin-top: 30px;">Order Items</h3>
            <table>
              <thead>
                <tr><th>Product</th><th>Variant</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${(order.product_items || []).map((item: any) => `
                  <tr>
                    <td>
                      ${item.product_name}
                      ${item.notes ? `<p class="item-notes"><em>Note: ${item.notes}</em></p>` : ''}
                    </td>
                    <td>${item.variant_details || 'Standard'}</td>
                    <td style="text-align: center;">${item.quantity || 1}</td>
                    <td style="text-align: right;">NPR ${(item.unit_price_npr || item.price || 0).toLocaleString('en-US')}</td>
                    <td style="text-align: right;">NPR ${((item.unit_price_npr || item.price || 0) * (item.quantity || 1)).toLocaleString('en-US')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              Total Amount: NPR ${(order.total_amount_npr || 0).toLocaleString('en-US')}
            </div>
            <button class="no-print" onclick="window.print()">Print this slip</button>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(slipHTML);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  if (isLoading) return <div className="p-6">Loading orders...</div>;

  return (
    <AdminAuthWrapper>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" suppressHydrationWarning>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <Card>
          <CardHeader>
            <CardTitle>All Dealer Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Dealer Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total (NPR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.created_at || order.created_date 
                        ? format(new Date(order.created_at || order.created_date), 'MMM d, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.dealer_email}</TableCell>
                    <TableCell>{order.product_items?.length || 0} items</TableCell>
                    <TableCell>NPR {(order.total_amount_npr || 0).toLocaleString('en-US')}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          {selectedOrder && selectedOrder.id === order.id && (
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                                  <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">Order Date</h4>
                                    <p className="text-base">
                                      {selectedOrder.created_at || selectedOrder.created_date 
                                        ? format(new Date(selectedOrder.created_at || selectedOrder.created_date), 'MMMM d, yyyy')
                                        : 'N/A'
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">Status</h4>
                                    <Badge className={getStatusBadgeClass(selectedOrder.status)}>{selectedOrder.status}</Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">Total Amount</h4>
                                    <p className="text-base font-bold text-red-600">NPR {(selectedOrder.total_amount_npr || 0).toLocaleString('en-US')}</p>
                                  </div>
                                </div>

                                <DealerInfoSection dealerEmail={selectedOrder.dealer_email} />

                                <div>
                                  <h4 className="font-semibold mb-4 text-lg">Order Items</h4>
                                  <div className="space-y-4">
                                    {(selectedOrder.product_items || []).map((item: any, index: number) => (
                                      <Card key={index} className="border border-gray-200 shadow-sm">
                                        <CardContent className="p-4">
                                          <div className="flex flex-col sm:flex-row gap-4">
                                            {item.product_image ? (
                                              <img 
                                                src={item.product_image} 
                                                alt={item.product_name}
                                                className="w-24 h-24 object-cover rounded-lg border flex-shrink-0"
                                              />
                                            ) : (
                                              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border flex-shrink-0">
                                                <Package className="w-8 h-8 text-gray-400" />
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-lg">{item.product_name || `Product ID: ${item.product_id}`}</h5>
                                              <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Variant:</span> {item.variant_details || 'Standard'}
                                              </p>
                                              <p className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Unit Price:</span> NPR {(item.unit_price_npr || item.price || 0).toLocaleString('en-US')}
                                              </p>
                                              <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Quantity:</span> {item.quantity || 1}
                                              </p>
                                            </div>
                                            <div className="text-right mt-4 sm:mt-0">
                                              <p className="font-bold text-lg">NPR {((item.unit_price_npr || item.price || 0) * (item.quantity || 1)).toLocaleString('en-US')}</p>
                                            </div>
                                          </div>
                                          {item.notes && (
                                            <div className="mt-4 pt-3 border-t">
                                              <div className="flex items-start gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                  <span className="font-medium text-blue-800">Special Notes:</span>
                                                  <p className="text-blue-700 mt-1">{item.notes}</p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePrintableSlip(order)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Slip
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={() => handleAction(order.id, 'Delivered')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                        
                        <Button variant="destructive" size="sm" onClick={() => handleAction(order.id, 'Archived')}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No orders found with the selected filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
