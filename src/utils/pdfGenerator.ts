import { jsPDF } from 'jspdf';

export interface QuotePDFData {
  id: string;
  client_name: string;
  company?: string;
  email: string;
  phone?: string;
  city: string;
  service_type: string;
  event_date?: string;
  description?: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  created_at?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export function generateQuotePDF(data: QuotePDFData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background Top Bar (Brand Dark Carbon)
  doc.setFillColor(23, 23, 23);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line (Magenta Vibrante #F72585)
  doc.setFillColor(247, 37, 133);
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Accent Line 2 (Amarillo Ácido #E8FF55)
  doc.setFillColor(232, 255, 85);
  doc.rect(0, 44.5, 40, 1.5, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 253, 248);
  doc.setFontSize(24);
  doc.text('SANCTUM', 20, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(232, 255, 85);
  doc.text('MARKETING · PUBLICIDAD · EVENTOS · ZONA NORTE CHILE', 20, 29);

  // Quote Metadata top right
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('COTIZACIÓN COMERCIAL', pageWidth - 20, 19, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`N° Ref: ${data.id}`, pageWidth - 20, 26, { align: 'right' });
  const dateStr = data.created_at ? new Date(data.created_at).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL');
  doc.text(`Fecha Emisión: ${dateStr}`, pageWidth - 20, 32, { align: 'right' });

  // Client Details Box
  let y = 56;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, y, pageWidth - 40, 36, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(20, y, pageWidth - 40, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 23, 23);
  doc.setFontSize(10);
  doc.text('DATOS DEL CLIENTE / RECEPTOR', 25, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(`Cliente: ${data.client_name}`, 25, y + 16);
  doc.text(`Empresa: ${data.company || 'Particular'}`, 25, y + 23);
  doc.text(`Ciudad: ${data.city}`, 25, y + 30);

  doc.text(`Email: ${data.email}`, 110, y + 16);
  doc.text(`Teléfono: ${data.phone || 'No especificado'}`, 110, y + 23);
  doc.text(`Fecha Evento / Campaña: ${data.event_date || 'A convenir'}`, 110, y + 30);

  // Project Service Box
  y = 98;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 23, 23);
  doc.text(`SERVICIO PRINCIPAL: ${data.service_type.toUpperCase()}`, 20, y);

  if (data.description) {
    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    const splitDesc = doc.splitTextToSize(`Descripción de la solicitud: ${data.description}`, pageWidth - 40);
    doc.text(splitDesc, 20, y);
    y += (splitDesc.length * 4) + 4;
  } else {
    y += 6;
  }

  // Items Table Header
  y += 4;
  doc.setFillColor(23, 23, 23);
  doc.rect(20, y, pageWidth - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('ÍTEM / DESCRIPCIÓN DEL SERVICIO', 24, y + 5.5);
  doc.text('CANT.', 125, y + 5.5, { align: 'center' });
  doc.text('VALOR UNIT.', 150, y + 5.5, { align: 'right' });
  doc.text('TOTAL', pageWidth - 24, y + 5.5, { align: 'right' });

  // Items Rows
  y += 8;
  const items = data.items && data.items.length > 0 
    ? data.items 
    : [{ description: data.service_type, quantity: 1, unit_price: data.subtotal, total_price: data.subtotal }];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 252, 252);
      doc.rect(20, y, pageWidth - 40, 7.5, 'F');
    }
    doc.setTextColor(40, 40, 40);
    doc.text(item.description, 24, y + 5);
    doc.text(String(item.quantity), 125, y + 5, { align: 'center' });
    doc.text(`$${Number(item.unit_price).toLocaleString('es-CL')}`, 150, y + 5, { align: 'right' });
    doc.text(`$${Number(item.total_price).toLocaleString('es-CL')}`, pageWidth - 24, y + 5, { align: 'right' });
    
    // Bottom border line
    doc.setDrawColor(240, 240, 240);
    doc.line(20, y + 7.5, pageWidth - 20, y + 7.5);
    y += 7.5;
  });

  // Totals Box
  y += 6;
  const totalsX = pageWidth - 80;

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(totalsX - 10, y, 70, 30, 1.5, 1.5, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(totalsX - 10, y, 70, 30, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text('Subtotal:', totalsX, y + 8);
  doc.text(`$${Number(data.subtotal).toLocaleString('es-CL')}`, pageWidth - 24, y + 8, { align: 'right' });

  doc.text('IVA (19%):', totalsX, y + 16);
  doc.text(`$${Number(data.iva_amount).toLocaleString('es-CL')}`, pageWidth - 24, y + 16, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(247, 37, 133); // Magenta
  doc.text('TOTAL CLP:', totalsX, y + 25);
  doc.text(`$${Number(data.total).toLocaleString('es-CL')}`, pageWidth - 24, y + 25, { align: 'right' });

  // Conditions & Bank note
  y += 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(23, 23, 23);
  doc.text('TÉRMINOS Y CONDICIONES COMERCIALES:', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text('1. Validez de la cotización: 15 días corridos a contar de la fecha de emisión.', 20, y + 5);
  doc.text('2. Cobertura operativa: Sujeta a confirmación de disponibilidad técnica en la fecha requerida.', 20, y + 10);
  doc.text('3. Forma de pago: 50% al momento de la adjudicación/reserva y 50% al término de la prestación.', 20, y + 15);
  doc.text('4. Valores expresados en Pesos Chilenos (CLP).', 20, y + 20);

  // Footer bar
  doc.setFillColor(23, 23, 23);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(232, 255, 85);
  doc.setFontSize(8.5);
  doc.text('SANCTUM — LAS IDEAS NO SE QUEDAN EN IDEAS.', pageWidth / 2, 287, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7);
  doc.text('Arica · Iquique · Antofagasta · Calama · Copiapó · La Serena | www.sanctum.cl', pageWidth / 2, 292, { align: 'center' });

  // Save / Download PDF
  doc.save(`Cotizacion_SANCTUM_${data.id}.pdf`);
}

