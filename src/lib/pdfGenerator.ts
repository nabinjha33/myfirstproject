import jsPDF from 'jspdf';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images?: string[];
  variants?: any[];
}

export const generateProductPDF = async (product: ProductData, isDealer: boolean = false) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(isDealer ? 'DEALER PRODUCT DETAILS' : 'PRODUCT DETAILS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Product Name
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(product.name, 20, yPosition);
  yPosition += 15;

  // Basic Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Brand: ${product.brand || 'N/A'}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Category: ${product.category || 'N/A'}`, 20, yPosition);
  yPosition += 15;

  // Description
  if (product.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description:', 20, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    
    // Split description into lines
    const descriptionLines = pdf.splitTextToSize(product.description, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += (descriptionLines.length * 6) + 10;
  }

  // Add product image if available
  if (product.images && product.images.length > 0) {
    try {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('Product Image:', 20, yPosition);
      yPosition += 10;

      // Convert image to base64 and add to PDF
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Calculate image dimensions to fit in PDF
            const imgWidth = 80;
            const imgHeight = (img.height * imgWidth) / img.width;
            
            pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
            resolve(true);
          } catch (error) {
            console.warn('Failed to add image to PDF:', error);
            resolve(false);
          }
        };
        img.onerror = () => {
          console.warn('Failed to load product image');
          resolve(false);
        };
        // Safe access to product.images with null check
        if (product.images && product.images[0]) {
          img.src = product.images[0];
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      console.warn('Error processing product image:', error);
    }
  }

  // Variants section
  if (product.variants && product.variants.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Product Variants:', 20, yPosition);
    yPosition += 10;

    // Table headers
    pdf.setFontSize(10);
    pdf.text('Size', 20, yPosition);
    pdf.text('Packaging', 70, yPosition);
    if (isDealer) {
      pdf.text('Est. Price (NPR)', 120, yPosition);
      pdf.text('Stock', 170, yPosition);
    } else {
      pdf.text('Stock Status', 120, yPosition);
    }
    yPosition += 8;

    // Draw line under headers
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Variant rows
    pdf.setFont('helvetica', 'normal');
    product.variants.forEach((variant, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(variant.size || 'N/A', 20, yPosition);
      pdf.text(variant.packaging || 'N/A', 70, yPosition);
      
      if (isDealer && variant.estimated_price_npr) {
        pdf.text(`NPR ${variant.estimated_price_npr.toLocaleString()}`, 120, yPosition);
      } else if (isDealer) {
        pdf.text('Contact for Price', 120, yPosition);
      }
      
      pdf.text(variant.stock_status || 'N/A', isDealer ? 170 : 120, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
  }

  // Footer information
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  
  if (isDealer) {
    pdf.text('Dealer Information:', 20, yPosition);
    yPosition += 6;
    pdf.text('This document contains confidential pricing information.', 20, yPosition);
    yPosition += 6;
    pdf.text('For internal use only.', 20, yPosition);
    yPosition += 10;
  } else {
    pdf.text('Contact us for pricing and availability.', 20, yPosition);
    yPosition += 10;
  }

  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Website: ${window.location.origin}`, 20, yPosition);

  // Save the PDF
  const fileName = `${isDealer ? 'dealer_' : ''}${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`;
  pdf.save(fileName);
};
