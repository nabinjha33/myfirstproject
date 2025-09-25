"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
import { Product, Shipment, User, Inquiry, Order } from '@/lib/entities';
import { Package, Users, Truck, MessageSquare, ShoppingCart, Activity } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, dealers: 0, shipments: 0, inquiries: 0, orders: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const chartData = [
    { name: 'Jan', inquiries: 40, orders: 24 },
    { name: 'Feb', inquiries: 30, orders: 13 },
    { name: 'Mar', inquiries: 20, orders: 98 },
    { name: 'Apr', inquiries: 27, orders: 39 },
    { name: 'May', inquiries: 18, orders: 48 },
    { name: 'Jun', inquiries: 23, orders: 38 },
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [products, users, shipments, inquiries, orders] = await Promise.all([
          Product.list(),
          User.list(),
          Shipment.list(),
          Inquiry.list(),
          Order.list()
        ]);
        
        setStats({
          products: products.length,
          dealers: users.filter((u: any) => u.role === 'user').length,
          shipments: shipments.length,
          inquiries: inquiries.length,
          orders: orders.length
        });
        
        const combinedActivity = [
            ...products.slice(0, 2).map((p: any) => ({ ...p, type: 'Product', date: p.created_date })),
            ...users.slice(0, 2).map((u: any) => ({ ...u, type: 'Dealer', date: u.created_date })),
            ...inquiries.slice(0, 2).map((i: any) => ({ ...i, type: 'Inquiry', date: i.created_date })),
        ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setRecentActivity(combinedActivity);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatCard title="Total Products" value={stats.products} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="All variants included" />
          <StatCard title="Active Dealers" value={stats.dealers} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Approved accounts" />
          <StatCard title="Ongoing Shipments" value={stats.shipments} icon={<Truck className="h-4 w-4 text-muted-foreground" />} description="ETA tracking active" />
          <StatCard title="New Inquiries" value={stats.inquiries} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} description="Past 30 days" />
          <StatCard title="Completed Orders" value={stats.orders} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} description="Past 30 days" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-4">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Inquiries vs Orders Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item: any) => (
                  <div key={item.id} className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      {item.type === 'Product' && <Package className="h-4 w-4" />}
                      {item.type === 'Dealer' && <Users className="h-4 w-4" />}
                      {item.type === 'Inquiry' && <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.type === 'Product' && `New Product: ${item.name}`}
                        {item.type === 'Dealer' && `New Dealer: ${item.full_name}`}
                        {item.type === 'Inquiry' && `New Inquiry from ${item.dealer_email}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          if (!item.date) return 'No date available';
                          const date = new Date(item.date);
                          return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy');
                        })()}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Badge variant={
                          item.type === 'Product' ? 'default' : 
                          item.type === 'Dealer' ? 'secondary' : 'outline'
                        }>{item.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
