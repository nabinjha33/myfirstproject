"use client";

import React from 'react';
import useCart from '@/components/useCart';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ShoppingCart, Plus, Minus, Info, Package, FileText } from "lucide-react";
import Link from 'next/link';
import { Order, User } from '@/lib/entities';
import { Badge } from "@/components/ui/badge";
import DealerAuthWrapper from '@/components/dealer/DealerAuthWrapper';
import { useDealerAuth } from '@/hooks/useDealerAuth';

export default function OrderCart() {
  const { cart, updateQuantity, updateNote, removeFromCart, clearCart, getCartTotal } = useCart('orderCart');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<any>(null);
  const { user: dealerUser } = useDealerAuth();

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
      console.log('Placing order...');
      
      if (!dealerUser || !dealerUser.email) {
        console.log('User not logged in');
        setSubmissionStatus({
          type: 'error',
          message: 'You must be logged in to place an order. Please log in and try again.'
        });
        setIsSubmitting(false);
        return;
      }

      const orderItems = cart.map((item: any) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        variant_id: item.variant.id,
        variant_details: `${item.variant.size || 'Standard'}${item.variant.packaging ? ` (${item.variant.packaging})` : ''}`,
        quantity: item.quantity,
        unit_price_npr: item.variant.estimated_price_npr || 0,
        notes: item.note || ''
      }));
      
      // Create order with basic fields that exist in current schema
      await Order.create({
        dealer_email: dealerUser.email,
        order_number: `JMI-${Date.now()}`,
        // Store product items as JSON string in a text field for now
        product_details: JSON.stringify(orderItems),
        total_amount_npr: getCartTotal(),
        status: 'Submitted',
        dealer_name: dealerUser.name || dealerUser.email,
        dealer_phone: dealerUser.phone || '',
        dealer_address: dealerUser.businessName || '',
        notes: `Order placed by ${dealerUser.name || dealerUser.email}. Items: ${orderItems.length} products.`
      });

      setSubmissionStatus({
        type: 'success',
        message: 'Your order has been placed successfully! You will receive a confirmation email shortly.'
      });
      clearCart();
      setTimeout(() => setSubmissionStatus(null), 5000);
    } catch (error: any) {
      console.error("Failed to place order", error);
      setSubmissionStatus({
        type: 'error',
        message: error.message.includes('not logged in') 
          ? 'You must be logged in to place an order. Please log in and try again.'
          : 'There was a problem placing your order. Please try again.'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <DealerAuthWrapper>
      <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Cart</h1>
            <p className="text-gray-600">Review items, add notes, and place your order.</p>
          </div>
          <Link href="/dealer/catalog">
            <Button variant="outline" className="hidden sm:flex">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {submissionStatus && submissionStatus.type === 'success' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
            <p className="font-bold">Order Placed!</p>
            <p>{submissionStatus.message}</p>
            <Link href="/dealer/my-orders">
              <Button variant="link" className="p-0 h-auto mt-2 text-green-800 font-bold">
                Track your orders
              </Button>
            </Link>
          </div>
        )}
        {submissionStatus && submissionStatus.type === 'error' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{submissionStatus.message}</p>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-red-600" />
              Your Order Items ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Info className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Your order cart is empty</h3>
                <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Browse our catalog to add products you wish to order.</p>
                <Link href="/dealer/catalog">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <ShoppingCart className="w-4 h-4 mr-2" /> 
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {cart.map((item: any) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Product Image and Info */}
                        <div className="flex gap-4 flex-1">
                          {item.product.images?.[0] ? (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.product.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{item.product.brand}</Badge>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded">
                                {item.variant.size || 'Standard'}
                                {item.variant.packaging && ` - ${item.variant.packaging}`}
                              </span>
                            </div>
                            <p className="text-sm text-red-600 font-medium">
                              NPR {item.variant.estimated_price_npr?.toLocaleString() || 'N/A'} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)} 
                            className="w-16 h-8 text-center" 
                            min="1"
                          />
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Subtotal and Actions */}
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          <p className="text-lg font-bold text-gray-900">
                            NPR {((item.variant.estimated_price_npr || 0) * item.quantity).toLocaleString()}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Special Notes</span>
                        </div>
                        <Textarea
                          placeholder="Add special requirements, specifications, or notes for this item..."
                          value={item.note || ''}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-6 border-t">
              <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Total</div>
                  <div className="text-2xl font-bold text-red-600">
                    NPR {getCartTotal().toLocaleString()}
                  </div>
                </div>
                <Button onClick={handlePlaceOrder} disabled={isSubmitting} size="lg" className="bg-red-600 hover:bg-red-700">
                  {isSubmitting ? 'Placing Order...' : `Place Order (${cart.length} items)`}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
      </div>
    </DealerAuthWrapper>
  );
}
