"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Variant {
  id: string;
  size: string;
  packaging: string;
  estimated_price_npr: number;
  stock_status: string;
}

interface VariantManagerProps {
  variants: Variant[];
  setVariants: (variants: Variant[]) => void;
}

export default function VariantManager({ variants, setVariants }: VariantManagerProps) {
  const handleAddVariant = () => {
    const newVariant = {
      id: `var_${Date.now()}`,
      size: '',
      packaging: '',
      estimated_price_npr: 0,
      stock_status: 'In Stock',
    };
    setVariants([...variants, newVariant]);
  };
  
  const handleRemoveVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id));
  };
  
  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            <TableHead>Packaging</TableHead>
            <TableHead>Est. Price (NPR)</TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map(variant => (
            <TableRow key={variant.id}>
              <TableCell>
                <Input value={variant.size} onChange={e => handleVariantChange(variant.id, 'size', e.target.value)} />
              </TableCell>
              <TableCell>
                <Input value={variant.packaging} onChange={e => handleVariantChange(variant.id, 'packaging', e.target.value)} />
              </TableCell>
              <TableCell>
                <Input type="number" value={variant.estimated_price_npr} onChange={e => handleVariantChange(variant.id, 'estimated_price_npr', Number(e.target.value))} />
              </TableCell>
              <TableCell>
                <Select value={variant.stock_status} onValueChange={value => handleVariantChange(variant.id, 'stock_status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(variant.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button type="button" variant="outline" onClick={handleAddVariant}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
      </Button>
    </div>
  );
}
