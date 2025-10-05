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
  
  // Colors
  const primaryColor = [220, 38, 38]; // Red-600
  const secondaryColor = [107, 114, 128]; // Gray-500
  const lightGray = [243, 244, 246]; // Gray-100

  // Header with company branding
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JEEN MATA IMPEX', 20, 16);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(isDealer ? 'CONFIDENTIAL DEALER PRODUCT SHEET' : 'PRODUCT INFORMATION SHEET', pageWidth - 20, 16, { align: 'right' });

  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  let yPosition = 40;

  // Product title section
  pdf.setFillColor(...lightGray);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 20, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(product.name, 20, yPosition + 7);
  yPosition += 30;

  // Two-column layout
  const leftColumnX = 20;
  const rightColumnX = pageWidth / 2 + 10;
  const columnWidth = (pageWidth / 2) - 25;

  // Left column - Basic Information
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('PRODUCT INFORMATION', leftColumnX, yPosition);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  yPosition += 10;

  const infoItems = [
    ['Brand:', product.brand || 'N/A'],
    ['Category:', product.category || 'N/A'],
    ['Product ID:', product.id.substring(0, 8) + '...']
  ];

  infoItems.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, leftColumnX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, leftColumnX + 25, yPosition);
    yPosition += 8;
  });

  // Right column - Product Image
  let rightColumnY = 50;
  if (product.images && product.images.length > 0) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Fixed image size for professional look
            const imgSize = 60;
            pdf.addImage(imgData, 'JPEG', rightColumnX, rightColumnY, imgSize, imgSize);
            
            // Image border
            pdf.setDrawColor(...secondaryColor);
            pdf.rect(rightColumnX, rightColumnY, imgSize, imgSize);
            
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        
        if (product.images && product.images[0]) {
          img.src = product.images[0];
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      console.warn('Error processing image:', error);
    }
  }

  // Description section
  yPosition = Math.max(yPosition, rightColumnY + 70);
  if (product.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('DESCRIPTION', leftColumnX, yPosition);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    yPosition += 8;
    
    const descriptionLines = pdf.splitTextToSize(product.description, pageWidth - 40);
    const maxLines = 4; // Limit description to 4 lines
    const displayLines = descriptionLines.slice(0, maxLines);
    pdf.text(displayLines, leftColumnX, yPosition);
    yPosition += (displayLines.length * 5) + 15;
  }

  // Variants section - Compact table format
  if (product.variants && product.variants.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('AVAILABLE VARIANTS', leftColumnX, yPosition);
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 12;

    // Table styling
    const tableStartY = yPosition;
    const rowHeight = 12;
    const colWidths = [40, 40, isDealer ? 50 : 60, isDealer ? 40 : 0];
    const colPositions = [leftColumnX, leftColumnX + colWidths[0], leftColumnX + colWidths[0] + colWidths[1], leftColumnX + colWidths[0] + colWidths[1] + colWidths[2]];

    // Table header
    pdf.setFillColor(...lightGray);
    pdf.rect(leftColumnX - 2, yPosition - 3, pageWidth - 35, rowHeight, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Size', colPositions[0], yPosition + 5);
    pdf.text('Packaging', colPositions[1], yPosition + 5);
    if (isDealer) {
      pdf.text('Price (NPR)', colPositions[2], yPosition + 5);
      pdf.text('Stock', colPositions[3], yPosition + 5);
    } else {
      pdf.text('Stock Status', colPositions[2], yPosition + 5);
    }
    
    yPosition += rowHeight;

    // Table rows - limit to 6 variants to fit on one page
    const displayVariants = product.variants.slice(0, 6);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    displayVariants.forEach((variant, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(leftColumnX - 2, yPosition - 3, pageWidth - 35, rowHeight, 'F');
      }
      
      pdf.text(variant.size || 'Standard', colPositions[0], yPosition + 5);
      pdf.text(variant.packaging || 'Default', colPositions[1], yPosition + 5);
      
      if (isDealer) {
        const price = variant.estimated_price_npr ? 
          `${variant.estimated_price_npr.toLocaleString()}` : 
          'Contact';
        pdf.text(price, colPositions[2], yPosition + 5);
        pdf.text(variant.stock_status || 'Available', colPositions[3], yPosition + 5);
      } else {
        pdf.text(variant.stock_status || 'Available', colPositions[2], yPosition + 5);
      }
      
      yPosition += rowHeight;
    });

    if (product.variants.length > 6) {
      pdf.setFont('helvetica', 'italic');
      pdf.text(`... and ${product.variants.length - 6} more variants`, leftColumnX, yPosition + 5);
      yPosition += 15;
    }
  }

  // Footer section
  const footerY = pageHeight - 30;
  
  // Footer background
  pdf.setFillColor(...lightGray);
  pdf.rect(0, footerY - 5, pageWidth, 35, 'F');
  
  // Footer content
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...secondaryColor);
  
  if (isDealer) {
    pdf.text('⚠ CONFIDENTIAL: This document contains dealer pricing information. For internal use only.', 20, footerY + 5);
  } else {
    pdf.text('📞 Contact us for detailed pricing and availability information.', 20, footerY + 5);
  }
  
  pdf.text(`Generated: ${new Date().toLocaleDateString()} | Website: ${window.location.origin}`, 20, footerY + 15);
  pdf.text('JEEN MATA IMPEX - Premium Import Solutions', pageWidth - 20, footerY + 15, { align: 'right' });

  // Save the PDF
  const fileName = `${isDealer ? 'dealer_' : ''}${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`;
  pdf.save(fileName);
};
