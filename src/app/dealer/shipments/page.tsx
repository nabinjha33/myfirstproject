"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Shipment } from "@/lib/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ship,
  Package,
  MapPin,
  Calendar,
  Clock,
  Search,
  Truck,
  Building,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import ShipmentStepper from '@/components/shipments/ShipmentStepper';
import DealerAuthWrapper from '@/components/dealer/DealerAuthWrapper';

const statusConfig = {
  "pending": {
    icon: Package,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
  "in_transit": {
    icon: Truck,
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "customs": {
    icon: Building,
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  "delivered": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-300",
  }
};

export default function Shipments() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const applyFilters = useCallback(() => {
    let filtered = [...shipments];

    if (searchQuery.trim()) {
      filtered = filtered.filter(shipment =>
        shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.product_names.some((name: string) =>
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        shipment.origin_country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(shipment => shipment.status === selectedStatus);
    }

    setFilteredShipments(filtered);
  }, [shipments, searchQuery, selectedStatus]);

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadShipments = async () => {
    setIsLoading(true);
    try {
      console.log('Loading shipments for dealer...');
      const data = await Shipment.list('-created_at');
      console.log('Shipments loaded:', data.length);
      console.log('Shipments data:', data);
      setShipments(data);
    } catch (error: any) {
      console.error('Failed to load shipments:', error);
      console.error('Error details:', error?.message || 'Unknown error');
      setShipments([]);
    }
    setIsLoading(false);
  };

  const getEtaStatus = (etaDate: string) => {
    const eta = new Date(etaDate);
    const now = new Date();
    const diffDays = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", color: "text-red-600", icon: AlertCircle };
    } else if (diffDays === 0) {
      return { text: "Due Today", color: "text-orange-600", icon: Clock };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: "text-yellow-600", icon: Clock };
    } else {
      return { text: `Due in ${diffDays} days`, color: "text-green-600", icon: Calendar };
    }
  };

  return (
    <DealerAuthWrapper>
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Import Shipments</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your import shipments from China and India with real-time ETA updates
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by tracking number, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "pending", label: "Pending" },
                { key: "in_transit", label: "In Transit" },
                { key: "customs", label: "Customs" },
                { key: "delivered", label: "Delivered" }
              ].map((status) => (
                <Button
                  key={status.key}
                  variant={selectedStatus === status.key ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status.key)}
                  className="whitespace-nowrap text-sm px-3 py-2"
                  size="sm"
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-16">
            <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shipments found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== "All"
                ? "Try adjusting your search or filters"
                : "No shipments are currently being tracked"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredShipments.map((shipment: any) => {
              const statusInfo = statusConfig[shipment.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;
              const etaStatus = getEtaStatus(shipment.eta_date);
              const EtaIcon = etaStatus.icon;

              return (
                <Card key={shipment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                          <Ship className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg sm:text-xl truncate">
                            {shipment.tracking_number}
                          </CardTitle>
                          <p className="text-sm sm:text-base text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">From {shipment.origin_country} to Nepal</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <Badge variant="outline" className={`${statusInfo.color} border font-medium text-xs sm:text-sm`}>
                          <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {shipment.status}
                        </Badge>

                        <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${etaStatus.color}`}>
                          <EtaIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          {etaStatus.text}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Status Timeline */}
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-800 text-sm sm:text-base">Shipment Progress</h4>
                        <ShipmentStepper currentStatus={shipment.status} />
                      </div>

                      {/* Shipment Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-1">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Shipment Info</h4>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600">ETA Date:</span>
                              <span className="font-medium text-right">
                                {format(new Date(shipment.eta_date), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600">Origin:</span>
                              <span className="font-medium text-right">{shipment.origin_country}</span>
                            </div>
                            {shipment.port_name && (
                              <div className="flex justify-between items-start">
                                <span className="text-gray-600">Port:</span>
                                <span className="font-medium text-right">{shipment.port_name}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="font-medium text-right">
                                {format(new Date(shipment.last_updated || shipment.created_date), "MMM d, HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Products in Shipment</h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {shipment.product_names.map((productName: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                                  {productName}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
                              {shipment.product_names.length} product{shipment.product_names.length > 1 ? 's' : ''} in this shipment
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </DealerAuthWrapper>
  );
}
