"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Order, User } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Package, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import DealerAuthWrapper from '@/components/dealer/DealerAuthWrapper';
import { useDealerAuth } from '@/hooks/useDealerAuth';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user: dealerUser } = useDealerAuth();

  const applyFilters = useCallback(() => {
    let filtered = [...orders];
    if (statusFilter !== 'All') {
      filtered = filtered.filter((order: any) => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  useEffect(() => {
    if (dealerUser) {
      fetchData();
    }
  }, [dealerUser]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = async () => {
    if (!dealerUser?.email) return;
    
    setIsLoading(true);
    try {
      console.log('Loading dealer orders for:', dealerUser.email);
      const allOrders = await Order.list('-created_at');
      console.log('All orders loaded:', allOrders.length);
      const orderData = allOrders.filter((order: any) => order.dealer_email === dealerUser.email);
      console.log('Dealer orders:', orderData.length);
      
      // Process orders to handle different data formats
      const processedOrders = orderData.map((order: any) => {
        let product_items = order.product_items;
        
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
          product_items: Array.isArray(product_items) ? product_items : []
        };
      });
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
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
                    <td>${item.variant_details}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">NPR ${(item.unit_price_npr || 0).toLocaleString('en-US')}</td>
                    <td style="text-align: right;">NPR ${((item.unit_price_npr || 0) * (item.quantity || 0)).toLocaleString('en-US')}</td>
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

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: { [key: string]: string } = {
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

  if (isLoading) return <div className="p-6">Loading your orders...</div>;
  
  return (
    <DealerAuthWrapper>
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40" suppressHydrationWarning>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Your Placed Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                <div key={order.id} className="border-b border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.created_at || order.created_date 
                          ? format(new Date(order.created_at || order.created_date), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <Badge className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{order.product_items?.length || 0} items</p>
                      <p className="font-semibold text-gray-900">NPR {(order.total_amount_npr || 0).toLocaleString('en-US')}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        {selectedOrder && selectedOrder.id === order.id && (
                          <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto sm:max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Order Details - {selectedOrder.order_number}</DialogTitle>
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
                                              <span className="font-medium">Unit Price:</span> NPR {item.unit_price_npr.toLocaleString('en-US')}
                                            </p>
                                             <p className="text-sm text-gray-600 mb-1">
                                              <span className="font-medium">Quantity:</span> {item.quantity}
                                            </p>
                                          </div>
                                          <div className="text-right mt-4 sm:mt-0">
                                            <p className="font-bold text-lg">NPR {(item.unit_price_npr * item.quantity).toLocaleString('en-US')}</p>
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
                        className="w-full"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No orders found with the selected filters.</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total (NPR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
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
                    <TableCell>{order.product_items?.length || 0} items</TableCell>
                    <TableCell>NPR {(order.total_amount_npr || 0).toLocaleString('en-US')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
                                                <span className="font-medium">Unit Price:</span> NPR {item.unit_price_npr.toLocaleString('en-US')}
                                              </p>
                                               <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Quantity:</span> {item.quantity}
                                              </p>
                                            </div>
                                            <div className="text-right mt-4 sm:mt-0">
                                              <p className="font-bold text-lg">NPR {(item.unit_price_npr * item.quantity).toLocaleString('en-US')}</p>
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
                      </div>
                    </TableCell>
                  </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No orders found with the selected filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DealerAuthWrapper>
  );
}