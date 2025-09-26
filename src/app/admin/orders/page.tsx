"use client";

import React, { useState, useEffect } from 'react';
import { Order, User } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle, Eye, Package, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orderData, user] = await Promise.all([
        Order.list('-created_at'),
        User.me()
      ]);
      setOrders(orderData.filter((o: any) => o.status !== 'Archived'));
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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
      'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Archived': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) return <div className="p-6">Loading orders...</div>;
  if (!currentUser) return <div className="p-6">You must be logged in to view this page.</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Orders</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Dealer Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Dealer Email</TableHead>
                  <TableHead>Total (NPR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.dealer_email}</TableCell>
                    <TableCell>{order.estimated_total_value?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
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
                                    <p className="text-base">{format(new Date(selectedOrder.created_at), 'MMMM d, yyyy')}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">Status</h4>
                                    <Badge className={getStatusBadgeClass(selectedOrder.status)}>{selectedOrder.status}</Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 text-sm">Total Amount</h4>
                                    <p className="text-base font-bold text-red-600">NPR {selectedOrder.estimated_total_value?.toLocaleString('en-US') || 'N/A'}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-4 text-lg">Order Items</h4>
                                  <div className="space-y-4">
                                    {(selectedOrder.items || []).map((item: any, index: number) => (
                                      <Card key={index} className="border border-gray-200 shadow-sm">
                                        <CardContent className="p-4">
                                          <div className="flex flex-col sm:flex-row gap-4">
                                            {item.product_image ? (
                                              <img src={item.product_image} alt={item.product_name} className="w-24 h-24 object-cover rounded-lg border flex-shrink-0" />
                                            ) : (
                                              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border flex-shrink-0">
                                                <Package className="w-8 h-8 text-gray-400" />
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-lg">{item.product_name}</h5>
                                              <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Variant:</span> {item.variant_details || 'Standard'}</p>
                                              <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Unit Price:</span> NPR {(item.unit_price_npr || item.price || 0).toLocaleString('en-US')}</p>
                                              <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Quantity:</span> {item.quantity || 1}</p>
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
                    <TableCell colSpan={6} className="text-center">No active orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
