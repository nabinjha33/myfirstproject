"use client";

import React, { useState, useEffect } from 'react';
import { Shipment, Product } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ShipmentStepper from '@/components/shipments/ShipmentStepper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function ShipmentForm({ shipment, products, onSubmitSuccess }: { shipment: any, products: any[], onSubmitSuccess: () => void }) {
    const [formData, setFormData] = useState({
        tracking_number: '',
        origin_country: 'China',
        status: 'Booked',
        eta_date: '',
        product_names: [] as string[]
    });

    useEffect(() => {
        if (shipment) setFormData(shipment);
    }, [shipment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            last_updated: new Date().toISOString()
        };
        if (shipment && shipment.id) {
            await Shipment.update(shipment.id, dataToSave);
        } else {
            await Shipment.create(dataToSave);
        }
        onSubmitSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="tracking_number" placeholder="Tracking Number" value={formData.tracking_number} onChange={e => setFormData({...formData, tracking_number: e.target.value})} required />
            <Select value={formData.origin_country} onValueChange={v => setFormData({...formData, origin_country: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="China">China</SelectItem><SelectItem value="India">India</SelectItem></SelectContent>
            </Select>
            <Input type="date" value={formData.eta_date} onChange={e => setFormData({...formData, eta_date: e.target.value})} />
             <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="At Port">At Port</SelectItem>
                    <SelectItem value="Customs">Customs</SelectItem>
                    <SelectItem value="In Warehouse">In Warehouse</SelectItem>
                </SelectContent>
            </Select>
            <div>
              <Label>Products</Label>
               <div className="h-40 overflow-y-auto border p-2 rounded-md">
                   {products.map((p: any) => (
                       <div key={p.id} className="flex items-center space-x-2">
                           <input type="checkbox" id={`prod-${p.id}`}
                               checked={formData.product_names.includes(p.name)}
                               onChange={e => {
                                   const newProductNames = e.target.checked
                                       ? [...formData.product_names, p.name]
                                       : formData.product_names.filter(name => name !== p.name);
                                   setFormData({...formData, product_names: newProductNames});
                               }}
                           />
                           <label htmlFor={`prod-${p.id}`}>{p.name}</label>
                       </div>
                   ))}
               </div>
            </div>
            <Button type="submit">Save Shipment</Button>
        </form>
    );
}

export default function AdminShipments() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any>(null);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [shipmentData, productData] = await Promise.all([Shipment.list(), Product.list()]);
    setShipments(shipmentData);
    setProducts(productData);
  };
  
  const handleFormSuccess = () => {
      setIsFormOpen(false);
      fetchData();
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Shipments</h1>
            <Button onClick={() => { setEditingShipment(null); setIsFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> New Shipment</Button>
        </div>
        
         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingShipment ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
            </DialogHeader>
            <ShipmentForm shipment={editingShipment} products={products} onSubmitSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>

        <Card>
            <CardContent className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tracking #</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Status Progress</TableHead>
                            <TableHead>ETA</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shipments.map((s: any) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.tracking_number}</TableCell>
                                <TableCell>{s.origin_country}</TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <Badge className={
                                            s.status === 'In Warehouse' ? 'bg-green-100 text-green-800' :
                                            s.status === 'Customs' ? 'bg-orange-100 text-orange-800' :
                                            s.status === 'At Port' ? 'bg-yellow-100 text-yellow-800' :
                                            s.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {s.status}
                                        </Badge>
                                        <div className="w-48">
                                            <ShipmentStepper currentStatus={s.status} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{s.eta_date || 'TBD'}</TableCell>
                                <TableCell>{s.product_names?.length || 0} items</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => { setSelectedShipment(s); setIsDetailOpen(true); }}
                                        >
                                            <Eye className="h-4 w-4 mr-1"/>
                                            View
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => { setEditingShipment(s); setIsFormOpen(true); }}
                                        >
                                            <Edit className="h-4 w-4 mr-1"/>
                                            Edit
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Shipment Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shipment Details</DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tracking Number</Label>
                    <p className="text-lg font-semibold">{selectedShipment.tracking_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Origin Country</Label>
                    <p className="text-lg">{selectedShipment.origin_country}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                    <Badge className="mt-1">{selectedShipment.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ETA Date</Label>
                    <p className="text-lg">{selectedShipment.eta_date || 'To be determined'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">Shipment Progress</Label>
                  <ShipmentStepper currentStatus={selectedShipment.status} />
                </div>
                
                {selectedShipment.product_names && selectedShipment.product_names.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-3 block">Products in Shipment</Label>
                    <div className="space-y-2">
                      {selectedShipment.product_names.map((productName: string, index: number) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span>{productName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
