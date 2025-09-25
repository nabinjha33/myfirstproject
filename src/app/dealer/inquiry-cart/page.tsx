"use client";

import React from 'react';
import useCart from '@/components/useCart';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, MessageSquare, Plus, Minus, Info, ShoppingCart } from "lucide-react";
import Link from 'next/link';
import { Inquiry } from '@/lib/entities';

export default function InquiryCart() {
  const { cart, updateQuantity, updateNote, removeFromCart, clearCart } = useCart('inquiryCart');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<string | null>(null);

  const handleSubmitInquiry = async () => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
      const dealerEmail = localStorage.getItem('dealerEmail') || 'dealer@example.com';
      const inquiryItems = cart.map(item => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        notes: item.note || '',
      }));
      
      await Inquiry.create({
        dealer_email: dealerEmail,
        product_items: inquiryItems,
        message: 'New inquiry from dealer portal'
      });

      setSubmissionStatus('success');
      clearCart();
      setTimeout(() => setSubmissionStatus(null), 5000);
    } catch (error) {
      console.error("Failed to submit inquiry", error);
      setSubmissionStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Cart</h1>
            <p className="text-gray-600">Review items and submit your inquiry for a quote.</p>
          </div>
          <Link href="/dealer/catalog">
            <Button variant="outline">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {submissionStatus === 'success' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Success!</p>
            <p>Your inquiry has been submitted. Our team will get back to you shortly.</p>
          </div>
        )}
        {submissionStatus === 'error' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>There was a problem submitting your inquiry. Please try again.</p>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-red-600" />
              Your Inquiry Items ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Your inquiry cart is empty.</h3>
                <p className="text-gray-500 mt-2 mb-4">Browse our catalog to add products for inquiry.</p>
                <Link href="/dealer/catalog">
                  <Button><ShoppingCart className="w-4 h-4 mr-2" /> Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {item.product.images?.[0] && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-gray-500">
                                {item.variant.size || 'Standard'} - {item.variant.packaging || 'Default'}
                              </div>
                              <div className="text-sm text-red-600 font-medium">
                                {item.product.brand}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)} 
                              className="w-20 text-center" 
                              min="1"
                            />
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea 
                            value={item.note || ''} 
                            onChange={(e) => updateNote(item.id, e.target.value)} 
                            placeholder="Add specific notes..." 
                            className="h-16 resize-none" 
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex justify-between items-center">
               <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
               <Button onClick={handleSubmitInquiry} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                {isSubmitting ? 'Submitting...' : `Submit Inquiry (${cart.length} items)`}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
