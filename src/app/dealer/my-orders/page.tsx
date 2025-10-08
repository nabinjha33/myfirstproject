"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Order, User } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Package, FileText, Download } from 'lucide-react';
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

  const downloadOrderSlip = async (order: any) => {
    const { jsPDF } = await import('jspdf');
    
    const allUsers = await User.list();
    const dealers = allUsers.filter((user: any) => user.email === order.dealer_email);
    const dealer = dealers.length > 0 ? dealers[0] : null;

    // Create new PDF document
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Helper function to add text with automatic line wrapping
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize?: number) => {
      if (fontSize) pdf.setFontSize(fontSize);
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * (fontSize ? fontSize * 0.4 : 5));
      } else {
        pdf.text(text, x, y);
        return y + (fontSize ? fontSize * 0.4 : 5);
      }
    };

    // Check if new page is needed
    const checkNewPage = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Company Header with Logo Area
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, 15, pageWidth - 30, 35, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38); // Red color
    yPosition = addText('JEEN MATA IMPEX', 20, 30, undefined, 24);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    yPosition = addText('Premium Import Solutions from China & India', 20, yPosition + 2, undefined, 12);
    
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition = 60;

    // Document Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    yPosition = addText('ORDER SLIP', pageWidth / 2 - 30, yPosition, undefined, 20);
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Order Information Box
    checkNewPage(40);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(15, yPosition, pageWidth - 30, 35, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, yPosition, pageWidth - 30, 35, 'S');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('ORDER INFORMATION', 20, yPosition + 8, undefined, 14);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const orderDate = order.created_at || order.created_date ? format(new Date(order.created_at || order.created_date), 'MMMM d, yyyy \'at\' h:mm a') : 'N/A';
    
    yPosition = addText(`Order Number: ${order.order_number}`, 20, yPosition + 5, undefined, 11);
    yPosition = addText(`Order Date: ${orderDate}`, 20, yPosition + 2, undefined, 11);
    yPosition = addText(`Order Status: ${order.status || 'Pending'}`, 20, yPosition + 2, undefined, 11);
    yPosition = addText(`Order Type: ${order.inquiry_type || 'Order'}`, 20, yPosition + 2, undefined, 11);
    yPosition += 15;

    // Dealer Information Box
    checkNewPage(60);
    pdf.setFillColor(248, 250, 252);
    const dealerBoxHeight = dealer ? 50 : 30;
    pdf.rect(15, yPosition, pageWidth - 30, dealerBoxHeight, 'F');
    pdf.rect(15, yPosition, pageWidth - 30, dealerBoxHeight, 'S');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('DEALER INFORMATION', 20, yPosition + 8, undefined, 14);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    if (dealer) {
      yPosition = addText(`Business Name: ${dealer.business_name || 'N/A'}`, 20, yPosition + 5, undefined, 11);
      yPosition = addText(`Contact Person: ${dealer.full_name || order.contact_person || 'N/A'}`, 20, yPosition + 2, undefined, 11);
      yPosition = addText(`Email: ${dealer.email}`, 20, yPosition + 2, undefined, 11);
      yPosition = addText(`Phone: ${dealer.phone || order.contact_phone || 'N/A'}`, 20, yPosition + 2, undefined, 11);
      if (dealer.address) {
        yPosition = addText(`Address: ${dealer.address}`, 20, yPosition + 2, pageWidth - 50, 11);
      }
      if (dealer.vat_pan) {
        yPosition = addText(`VAT/PAN: ${dealer.vat_pan}`, 20, yPosition + 2, undefined, 11);
      }
    } else {
      yPosition = addText(`Dealer Email: ${order.dealer_email}`, 20, yPosition + 5, undefined, 11);
      yPosition = addText(`Contact Person: ${order.contact_person || 'N/A'}`, 20, yPosition + 2, undefined, 11);
      yPosition = addText(`Contact Phone: ${order.contact_phone || 'N/A'}`, 20, yPosition + 2, undefined, 11);
    }
    yPosition += 15;

    // Order Items Section
    checkNewPage(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('ORDER ITEMS', 20, yPosition, undefined, 16);
    yPosition += 5;

    if (order.product_items && order.product_items.length > 0) {
      // Table headers with background
      checkNewPage(30);
      pdf.setFillColor(220, 38, 38);
      pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255); // White text
      pdf.text('S.N.', 20, yPosition + 8);
      pdf.text('Product Name', 35, yPosition + 8);
      pdf.text('Variant/Size', 100, yPosition + 8);
      pdf.text('Qty', 135, yPosition + 8);
      pdf.text('Unit Price (NPR)', 150, yPosition + 8);
      pdf.text('Total (NPR)', 180, yPosition + 8);
      
      pdf.setTextColor(0, 0, 0); // Reset to black
      yPosition += 15;

      let totalAmount = 0;
      
      // Order items with alternating row colors
      for (let i = 0; i < order.product_items.length; i++) {
        const item = order.product_items[i];
        checkNewPage(25);
        
        // Alternating row background
        if (i % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(15, yPosition - 3, pageWidth - 30, 20, 'F');
        }

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        const productName = pdf.splitTextToSize(item.product_name || `Product ID: ${item.product_id}`, 60);
        const variantName = pdf.splitTextToSize(item.variant_details || 'Standard', 30);
        const itemTotal = (item.unit_price_npr || 0) * (item.quantity || 0);
        totalAmount += itemTotal;
        
        pdf.text((i + 1).toString(), 20, yPosition + 5);
        pdf.text(productName, 35, yPosition + 5);
        pdf.text(variantName, 100, yPosition + 5);
        pdf.text((item.quantity || 0).toString(), 135, yPosition + 5);
        pdf.text((item.unit_price_npr || 0).toLocaleString(), 150, yPosition + 5);
        pdf.text(itemTotal.toLocaleString(), 180, yPosition + 5);
        
        let rowHeight = Math.max(productName.length, variantName.length) * 4 + 8;
        
        // Add brand and category if available
        if (item.brand_name || item.category_name) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 100, 100);
          let brandCategoryText = '';
          if (item.brand_name) brandCategoryText += `Brand: ${item.brand_name}`;
          if (item.category_name) brandCategoryText += (brandCategoryText ? ' | ' : '') + `Category: ${item.category_name}`;
          pdf.text(brandCategoryText, 35, yPosition + rowHeight - 5);
          pdf.setTextColor(0, 0, 0);
          rowHeight += 5;
        }

        // Add notes if present
        if (item.notes) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(0, 100, 200);
          const noteLines = pdf.splitTextToSize(`Note: ${item.notes}`, 120);
          pdf.text(noteLines, 35, yPosition + rowHeight);
          pdf.setTextColor(0, 0, 0);
          rowHeight += noteLines.length * 4 + 3;
        }
        
        yPosition += rowHeight;
      }

      // Total section
      checkNewPage(30);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;
      
      pdf.setFillColor(220, 38, 38);
      pdf.rect(130, yPosition - 3, pageWidth - 145, 15, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`TOTAL: NPR ${totalAmount.toLocaleString()}`, 135, yPosition + 7);
      pdf.setTextColor(0, 0, 0);
      yPosition += 20;

      // Summary box
      checkNewPage(25);
      pdf.setFillColor(254, 249, 195);
      pdf.rect(15, yPosition, pageWidth - 30, 20, 'F');
      pdf.setDrawColor(251, 191, 36);
      pdf.rect(15, yPosition, pageWidth - 30, 20, 'S');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`Total Items: ${order.product_items.length}`, 20, yPosition + 6, undefined, 10);
      yPosition = addText(`Estimated Total Value: NPR ${totalAmount.toLocaleString()}`, 20, yPosition + 2, undefined, 10);
      yPosition += 15;

    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      yPosition = addText('No items found in this order', 20, yPosition, undefined, 12);
      pdf.setTextColor(0, 0, 0);
      yPosition += 20;
    }

    // Additional Notes
    if (order.additional_notes) {
      checkNewPage(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('ADDITIONAL NOTES', 20, yPosition, undefined, 14);
      
      pdf.setFillColor(248, 250, 252);
      const notesHeight = 25;
      pdf.rect(15, yPosition, pageWidth - 30, notesHeight, 'F');
      pdf.rect(15, yPosition, pageWidth - 30, notesHeight, 'S');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(order.additional_notes, 20, yPosition + 8, pageWidth - 50, 10);
      yPosition += 20;
    }

    // Footer
    const footerY = pageHeight - 25;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerY);
    pdf.text('Jeen Mata Impex - Dealer Portal', pageWidth - 80, footerY);
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth / 2 - 15, footerY);

    // Save the PDF
    pdf.save(`JeenMata_OrderSlip_${order.order_number}_${new Date().toISOString().split('T')[0]}.pdf`);
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
                        onClick={() => downloadOrderSlip(order)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
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
                          onClick={() => downloadOrderSlip(order)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Slip
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