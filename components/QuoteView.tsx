'use client';

import { useState, useRef } from 'react';
import { CartItem } from '@/app/page';
import { AppAction } from '@/components/Header';

interface QuoteViewProps {
  items: CartItem[];
  customer: { name: string; id: string; company: string } | null;
  quoteRef: string;
  depot: string;
  dispatch: React.Dispatch<AppAction>;
}

export default function QuoteView({ items, customer, quoteRef, depot, dispatch }: QuoteViewProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const quoteRef2 = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((sum, item) => {
    const weeks = Math.floor(item.durationDays / 7);
    const days = item.durationDays % 7;
    return sum + (weeks * item.product.weeklyRate + days * item.product.dailyRate) * item.quantity;
  }, 0);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  async function downloadPDF() {
    setDownloading(true);
    setError('');
    try {
      const jsPDFModule = await import('jspdf');
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const pageW = 210;
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 0;

      // Orange header band
      doc.setFillColor(255, 102, 0);
      doc.rect(0, 0, pageW, 38, 'F');

      // BOELS logo text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('BOELS', margin, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Rental Portal · In-Store Quote', margin, 30);

      // Quote header info (right side)
      doc.setFontSize(9);
      doc.text('RENTAL QUOTATION', pageW - margin, 14, { align: 'right' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(quoteRef, pageW - margin, 22, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(today, pageW - margin, 30, { align: 'right' });

      y = 50;

      // Customer & Depot info blocks
      doc.setFillColor(245, 246, 250);
      doc.roundedRect(margin, y, contentW / 2 - 3, 32, 2, 2, 'F');
      doc.roundedRect(margin + contentW / 2 + 3, y, contentW / 2 - 3, 32, 2, 2, 'F');

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER', margin + 4, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(13, 27, 42);
      doc.setFontSize(9);
      doc.text(customer?.name ?? 'Walk-in Customer', margin + 4, y + 14);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(customer?.company ?? '—', margin + 4, y + 20);
      doc.text(`ID: ${customer?.id ?? 'CASH'}`, margin + 4, y + 26);

      const col2x = margin + contentW / 2 + 7;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DEPOT / PICKUP', col2x, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(13, 27, 42);
      doc.setFontSize(9);
      doc.text(depot, col2x, y + 14);
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Opening hours: Mon–Sat 07:00–18:00', col2x, y + 20);
      doc.text('Tel: +31 (0) 88 222 0000', col2x, y + 26);

      y += 42;

      // Table header
      doc.setFillColor(13, 27, 42);
      doc.rect(margin, y, contentW, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('EQUIPMENT', margin + 3, y + 5.5);
      doc.text('DAILY', margin + 100, y + 5.5, { align: 'center' });
      doc.text('DURATION', margin + 122, y + 5.5, { align: 'center' });
      doc.text('QTY', margin + 142, y + 5.5, { align: 'center' });
      doc.text('SUBTOTAL', pageW - margin - 3, y + 5.5, { align: 'right' });

      y += 10;

      // Table rows
      items.forEach((item, idx) => {
        const weeks = Math.floor(item.durationDays / 7);
        const days = item.durationDays % 7;
        const lineTotal = (weeks * item.product.weeklyRate + days * item.product.dailyRate) * item.quantity;
        const durationLabel =
          weeks > 0 && days > 0
            ? `${weeks}w ${days}d`
            : weeks > 0
            ? `${weeks} week${weeks !== 1 ? 's' : ''}`
            : `${days} day${days !== 1 ? 's' : ''}`;

        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, y - 1, contentW, 9, 'F');
        }

        doc.setTextColor(13, 27, 42);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(item.product.name, margin + 3, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7.5);
        doc.text(`€${item.product.dailyRate}/day`, margin + 100, y + 5, { align: 'center' });
        doc.text(durationLabel, margin + 122, y + 5, { align: 'center' });
        doc.text(`${item.quantity}x`, margin + 142, y + 5, { align: 'center' });

        doc.setTextColor(255, 102, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`€${lineTotal.toFixed(2)}`, pageW - margin - 3, y + 5, { align: 'right' });

        y += 9;
      });

      // Divider
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + 2, pageW - margin, y + 2);
      y += 8;

      // Totals
      const totalsX = pageW - margin - 60;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal (excl. VAT)', totalsX, y);
      doc.text(`€${subtotal.toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });
      y += 7;
      doc.text('VAT 21%', totalsX, y);
      doc.text(`€${vat.toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });
      y += 4;
      doc.setDrawColor(255, 102, 0);
      doc.line(totalsX, y, pageW - margin, y);
      y += 5;
      doc.setTextColor(13, 27, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', totalsX, y);
      doc.text(`€${total.toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });

      y += 15;

      // Terms & conditions box
      doc.setFillColor(245, 246, 250);
      doc.roundedRect(margin, y, contentW, 28, 2, 2, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TERMS & CONDITIONS', margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      const terms = [
        '• This quotation is valid for 30 days from the date above.',
        '• Rental period begins upon collection and ends upon return to the depot.',
        '• All equipment must be returned in the same condition as collected.',
        '• Boels standard rental conditions (algemene verhuurvoorwaarden) apply — available at all depots.',
        '• Prices exclude VAT (BTW). A deposit may be required upon collection.',
      ];
      terms.forEach((t, i) => {
        doc.text(t, margin + 4, y + 12 + i * 4);
      });

      // Footer
      doc.setFillColor(13, 27, 42);
      doc.rect(0, 282, pageW, 15, 'F');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.text('Boels Rental · www.boels.com · +31 (0) 88 222 0000', pageW / 2, 290, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.text(`Quote ref: ${quoteRef}`, margin, 290);
      doc.text(`Page 1 of 1`, pageW - margin, 290, { align: 'right' });

      doc.save(`Boels-Quote-${quoteRef}.pdf`);
    } catch (err) {
      console.error(err);
      setError('PDF generation failed. Please try again or use your browser\'s Print function (Ctrl+P).');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
        className="text-sm text-gray-500 hover:text-boels-orange flex items-center gap-1.5 mb-6 transition-colors"
      >
        ← Back to catalog
      </button>

      {/* Quote card */}
      <div ref={quoteRef2} className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Orange header */}
        <div className="bg-boels-orange px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-black text-white text-2xl tracking-tight">BOELS</div>
            <div className="text-orange-100 text-sm">Rental Quotation</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-lg">{quoteRef}</div>
            <div className="text-orange-100 text-sm">{today}</div>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
            <p className="font-semibold text-boels-dark">{customer?.name ?? 'Walk-in Customer'}</p>
            <p className="text-sm text-gray-500">{customer?.company ?? '—'}</p>
            <p className="text-xs text-boels-orange font-medium">{customer?.id ?? 'CASH'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Pickup Depot</p>
            <p className="font-semibold text-boels-dark">{depot}</p>
            <p className="text-sm text-gray-500">Mon–Sat 07:00–18:00</p>
            <p className="text-xs text-gray-500">+31 (0) 88 222 0000</p>
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-boels-dark text-white">
                <th className="text-left px-6 py-3 font-semibold text-xs uppercase tracking-wide">Equipment</th>
                <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Rate</th>
                <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wide">Duration</th>
                <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Qty</th>
                <th className="text-right px-6 py-3 font-semibold text-xs uppercase tracking-wide">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const weeks = Math.floor(item.durationDays / 7);
                const days = item.durationDays % 7;
                const lineTotal = (weeks * item.product.weeklyRate + days * item.product.dailyRate) * item.quantity;
                const durLabel =
                  weeks > 0 && days > 0
                    ? `${weeks}w ${days}d`
                    : weeks > 0
                    ? `${weeks} week${weeks !== 1 ? 's' : ''}`
                    : `${days} day${days !== 1 ? 's' : ''}`;

                return (
                  <tr key={item.product.id} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0 hidden sm:block"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/${item.product.id}/100/100`;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-boels-dark">{item.product.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 hidden sm:table-cell">
                      €{item.product.dailyRate}/day
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700 font-medium">{durLabel}</td>
                    <td className="px-3 py-3 text-center text-gray-700 hidden sm:table-cell">{item.quantity}×</td>
                    <td className="px-6 py-3 text-right font-bold text-boels-orange">€{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col items-end gap-1.5 max-w-xs ml-auto">
            <div className="flex justify-between w-full text-sm text-gray-600">
              <span>Subtotal (excl. VAT)</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full text-sm text-gray-600">
              <span>VAT 21%</span>
              <span>€{vat.toFixed(2)}</span>
            </div>
            <div className="w-full border-t border-boels-orange my-1" />
            <div className="flex justify-between w-full">
              <span className="font-black text-boels-dark text-lg">TOTAL</span>
              <span className="font-black text-boels-orange text-lg">€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-500">Terms & Conditions</p>
            <p>• This quotation is valid for 30 days from the date above.</p>
            <p>• Rental period begins upon collection and ends upon return to the depot.</p>
            <p>• All equipment must be returned in the same condition as collected.</p>
            <p>• Standard Boels rental conditions apply — available at all depots and on boels.com.</p>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-3 bg-boels-orange hover:bg-boels-orange-dark text-white font-bold py-4 rounded-xl text-base transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <span className="animate-spin text-xl">⟳</span>
              Generating PDF...
            </>
          ) : (
            <>
              <span className="text-xl">📥</span>
              Download Quote as PDF
            </>
          )}
        </button>
        <button
          onClick={() => {
            dispatch({ type: 'CLEAR_CART' });
            dispatch({ type: 'SET_VIEW', payload: 'catalog' });
          }}
          className="sm:w-auto px-6 py-4 border-2 border-gray-200 hover:border-boels-orange text-gray-600 hover:text-boels-orange font-semibold rounded-xl transition-all"
        >
          New Quote
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm text-red-700 font-medium">PDF Generation Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <button
              onClick={downloadPDF}
              className="mt-2 text-xs text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
