"use client";

import React, { useState, useEffect } from 'react';
// Removed lodash dependency - using native JavaScript methods instead
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });

import { Product, Shipment, User, Order, DealerApplication, PageVisit } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import {
  Package,
  Users,
  Truck,
  ShoppingCart,
  Activity,
  UserCheck,
  UserX,
  Eye,
  Clock
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    approvedDealers: 0,
    pendingApplications: 0,
    shipments: 0,
    visitorsToday: 0,
    totalVisits: 0,
    orderStats: { submitted: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
  });
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [recentPending, setRecentPending] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [products, users, shipments, recentOrdersData, applications, visits] = await Promise.all([
        Product.list(),
        User.list(),
        Shipment.list(),
        Order.list('-created_at', 5),
        DealerApplication.list(),
        PageVisit.list('-created_at', 1000)
      ]);

      const allOrders = await Order.list();
      const orderStats = {
        submitted: allOrders.filter((o: any) => o.status === 'Submitted').length,
        confirmed: allOrders.filter((o: any) => o.status === 'Confirmed').length,
        processing: allOrders.filter((o: any) => o.status === 'Processing').length,
        shipped: allOrders.filter((o: any) => o.status === 'Shipped').length,
        delivered: allOrders.filter((o: any) => o.status === 'Delivered').length,
        cancelled: allOrders.filter((o: any) => o.status === 'Cancelled').length
      };

      const today = new Date();
      const visitorsTodayCount = visits.filter((v: any) => new Date(v.visited_at || v.created_at) >= startOfDay(today)).length;
      const approvedDealersCount = users.filter((u: any) => u.dealer_status === 'Approved').length;
      const pendingApps = applications.filter((app: any) => app.status === 'Pending');

      setStats({
        products: products.length,
        approvedDealers: approvedDealersCount,
        pendingApplications: pendingApps.length,
        shipments: shipments.length,
        visitorsToday: visitorsTodayCount,
        totalVisits: visits.length,
        orderStats
      });
      
      setRecentPending(pendingApps.slice(0, 5));
      setRecentOrders(recentOrdersData);

      const sevenDaysAgo = subDays(new Date(), 6);
      const recentVisits = visits.filter((v: any) => new Date(v.visited_at || v.created_at) >= startOfDay(sevenDaysAgo));
      
      // Group visits by day using native JavaScript
      const visitsByDay = recentVisits.reduce((acc: any, v: any) => {
        const dateKey = format(new Date(v.visited_at || v.created_at), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(v);
        return acc;
      }, {});
      
      // Create chart data for last 7 days using native JavaScript
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        return {
          date: format(date, 'MMM d'),
          visits: visitsByDay[formattedDate]?.length || 0,
        };
      }).reverse();

      setTrafficData(chartData);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
    setIsLoading(false);
  };

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

        {isLoading ? <p>Loading dashboard...</p> : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
              <StatCard title="Visitors Today" value={stats.visitorsToday} icon={<Eye className="h-4 w-4 text-muted-foreground" />} description="Unique page views" />
              <StatCard title="Pending Applications" value={stats.pendingApplications} icon={<Clock className="h-4 w-4 text-muted-foreground" />} description="Awaiting review" />
              <StatCard title="Approved Dealers" value={stats.approvedDealers} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Active dealer accounts" />
              <StatCard title="Total Products" value={stats.products} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="All variants included" />
            </div>

            <div className="grid gap-6 md:grid-cols-1 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.orderStats.submitted}</div>
                      <p className="text-sm text-gray-600">Submitted</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.orderStats.confirmed}</div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.orderStats.processing}</div>
                      <p className="text-sm text-gray-600">Processing</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.orderStats.shipped}</div>
                      <p className="text-sm text-gray-600">Shipped</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{stats.orderStats.delivered}</div>
                      <p className="text-sm text-gray-600">Delivered</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.orderStats.cancelled}</div>
                      <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Traffic (Last 7 Days)</CardTitle>
                    <CardDescription>Page visits across the public-facing site.</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="visits" stroke="#dc2626" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders from dealers.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Dealer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.slice(0, 5).map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{order.dealer_email}</TableCell>
                            <TableCell>NPR {order.total_amount_npr?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Dealer Applications</CardTitle>
                    <CardDescription>Review and take action on new applications.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentPending.length > 0 ? (
                      <div className="space-y-4">
                        {recentPending.map((app: any) => (
                          <div key={app.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                            <div>
                              <p className="font-medium text-sm">{app.business_name}</p>
                              <p className="text-xs text-muted-foreground">{app.contact_person}</p>
                            </div>
                            <Link href="/admin/dealers">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                         <Link href="/admin/dealers">
                           <Button variant="outline" className="w-full mt-4">View All Applications</Button>
                         </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground py-4">No pending applications.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
