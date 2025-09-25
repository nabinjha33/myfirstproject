"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ShoppingCart, 
    Plus, 
    Minus, 
    Trash2, 
    Send, 
    Package,
    Edit3,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useCart from '@/components/useCart';
import { Order, User } from '@/lib/entities';
import Link from 'next/link';

interface CartItem {
    id: string;
    product: any;
    variant: any;
    quantity: number;
    note: string;
}

export default function OrderCart() {
    const { cart, updateQuantity, updateNote, removeFromCart, clearCart, getCartItemCount } = useCart('inquiry-cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<string | null>(null);
    const [dealerInfo, setDealerInfo] = useState<any>(null);
    const [orderNotes, setOrderNotes] = useState('');

    useEffect(() => {
        fetchDealerInfo();
    }, []);

    const fetchDealerInfo = async () => {
        try {
            const user = await User.me();
            setDealerInfo(user);
        } catch (error) {
            console.error('Failed to fetch dealer info:', error);
            // Mock data for demo
            setDealerInfo({
                business_name: 'Demo Hardware Store',
                full_name: 'Demo User',
                email: 'demo@example.com',
                phone: '+977-9876543210'
            });
        }
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleNoteChange = (itemId: string, note: string) => {
        updateNote(itemId, note);
    };

    const handleSubmitInquiry = async () => {
        if (cart.length === 0) {
            setSubmitStatus('empty');
            setTimeout(() => setSubmitStatus(null), 3000);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Prepare order data
            const orderData = {
                dealer_email: dealerInfo?.email || 'demo@example.com',
                dealer_name: dealerInfo?.business_name || 'Demo Store',
                contact_person: dealerInfo?.full_name || 'Demo User',
                contact_phone: dealerInfo?.phone || '+977-9876543210',
                status: 'Submitted',
                order_date: new Date().toISOString(),
                items: cart.map((item: CartItem) => ({
                    product_name: item.product.name,
                    product_brand: item.product.brand,
                    variant_size: item.variant.size,
                    variant_packaging: item.variant.packaging,
                    estimated_price_npr: item.variant.estimated_price_npr,
                    quantity: item.quantity,
                    notes: item.note,
                    total_estimated_value: (item.variant.estimated_price_npr || 0) * item.quantity
                })),
                total_items: cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
                estimated_total_value: cart.reduce((sum: number, item: CartItem) => 
                    sum + ((item.variant.estimated_price_npr || 0) * item.quantity), 0
                ),
                additional_notes: orderNotes,
                inquiry_type: 'Product Inquiry'
            };

            // Submit the order
            await Order.create(orderData);

            setSubmitStatus('success');
            clearCart();
            setOrderNotes('');
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 3000);
        }

        setIsSubmitting(false);
    };

    const getTotalEstimatedValue = () => {
        return cart.reduce((total: number, item: CartItem) => {
            return total + ((item.variant.estimated_price_npr || 0) * item.quantity);
        }, 0);
    };

    if (cart.length === 0 && submitStatus !== 'success') {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <ShoppingCart className="h-8 w-8 text-gray-700" />
                        <h1 className="text-3xl font-bold text-gray-900">Inquiry Cart</h1>
                    </div>

                    <Card>
                        <CardContent className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your inquiry cart is empty</h3>
                            <p className="text-gray-600 mb-6">
                                Browse our products and add items to your inquiry cart to request quotes.
                            </p>
                            <Link href="/products">
                                <Button>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Browse Products
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-gray-700" />
                        <h1 className="text-3xl font-bold text-gray-900">Inquiry Cart</h1>
                        <Badge variant="secondary" className="ml-2">
                            {getCartItemCount()} items
                        </Badge>
                    </div>
                    <Link href="/products">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                {submitStatus && (
                    <Alert className={`mb-6 ${
                        submitStatus === 'success' ? 'border-green-200 bg-green-50' : 
                        submitStatus === 'empty' ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                    }`}>
                        <AlertDescription className={
                            submitStatus === 'success' ? 'text-green-800' : 
                            submitStatus === 'empty' ? 'text-yellow-800' :
                            'text-red-800'
                        }>
                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    ✅ Inquiry submitted successfully! We'll contact you soon with quotes.
                                </div>
                            )}
                            {submitStatus === 'empty' && '⚠️ Please add items to your cart before submitting.'}
                            {submitStatus === 'error' && '❌ Failed to submit inquiry. Please try again.'}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Items in Your Cart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cart.map((item: CartItem) => (
                                        <div key={item.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">{item.product.name}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                        <Badge variant="outline">{item.product.brand}</Badge>
                                                        <span>Size: {item.variant.size || 'Standard'}</span>
                                                        <span>Packaging: {item.variant.packaging || 'Standard'}</span>
                                                    </div>
                                                    {item.variant.estimated_price_npr && (
                                                        <p className="text-lg font-medium text-green-600 mt-2">
                                                            NPR {item.variant.estimated_price_npr.toLocaleString()} per unit
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium">Quantity</Label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                            className="w-20 text-center"
                                                            min="1"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Special Notes</Label>
                                                    <div className="relative mt-1">
                                                        <Textarea
                                                            placeholder="Any specific requirements..."
                                                            value={item.note}
                                                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                                            className="min-h-[60px]"
                                                        />
                                                        <Edit3 className="absolute top-2 right-2 w-3 h-3 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {item.variant.estimated_price_npr && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Subtotal:</span>
                                                        <span className="font-semibold">
                                                            NPR {(item.variant.estimated_price_npr * item.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary & Submit */}
                    <div className="space-y-6">
                        {/* Dealer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm text-gray-600">Business Name</Label>
                                    <p className="font-medium">{dealerInfo?.business_name || 'Loading...'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600">Contact Person</Label>
                                    <p className="font-medium">{dealerInfo?.full_name || 'Loading...'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600">Email</Label>
                                    <p className="font-medium">{dealerInfo?.email || 'Loading...'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600">Phone</Label>
                                    <p className="font-medium">{dealerInfo?.phone || 'Loading...'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Items:</span>
                                        <span className="font-medium">{getCartItemCount()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Unique Products:</span>
                                        <span className="font-medium">{cart.length}</span>
                                    </div>
                                    {getTotalEstimatedValue() > 0 && (
                                        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                            <span>Estimated Total:</span>
                                            <span className="text-green-600">
                                                NPR {getTotalEstimatedValue().toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <Label htmlFor="order-notes" className="text-sm font-medium">
                                        Additional Notes
                                    </Label>
                                    <Textarea
                                        id="order-notes"
                                        placeholder="Any additional requirements or questions..."
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitInquiry}
                                    disabled={isSubmitting || cart.length === 0}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    size="lg"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    By submitting, you agree to receive quotes and communication from our team.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
