'use client';

import { useState } from 'react';
import { AppAction } from '@/components/Header';

interface AccountViewProps {
  customer: { name: string; id: string; company: string };
  dispatch: React.Dispatch<AppAction>;
}

type Tab = 'dashboard' | 'orders' | 'invoices' | 'tickets' | 'claims';

interface Order {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  depot: string;
  startDate: string;
  endDate?: string;
  items: { name: string; qty: number; days: number; total: number }[];
  total: number;
  paid: boolean;
}

interface Invoice {
  id: string;
  orderId: string;
  status: 'open' | 'paid' | 'overdue';
  amount: number;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  updatedDate: string;
  category: string;
  messages: { from: 'customer' | 'support'; text: string; date: string }[];
}

interface Claim {
  id: string;
  equipment: string;
  orderId: string;
  status: 'submitted' | 'under_review' | 'resolved' | 'rejected';
  type: 'damage' | 'loss' | 'malfunction';
  description: string;
  submittedDate: string;
  resolution?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2025-8821',
    status: 'active',
    depot: 'Boels Depot Amsterdam-Noord',
    startDate: '15 Apr 2025',
    endDate: '22 Apr 2025',
    items: [
      { name: 'Mini Excavator 1.5T', qty: 1, days: 7, total: 650 },
      { name: 'Plate Compactor 80kg', qty: 1, days: 7, total: 195 },
    ],
    total: 845,
    paid: false,
  },
  {
    id: 'ORD-2025-7614',
    status: 'completed',
    depot: 'Boels Depot Amsterdam-Noord',
    startDate: '2 Mar 2025',
    endDate: '5 Mar 2025',
    items: [
      { name: 'Concrete Mixer 160L', qty: 1, days: 3, total: 135 },
      { name: 'Concrete Vibrator Electric', qty: 1, days: 3, total: 66 },
    ],
    total: 201,
    paid: true,
  },
  {
    id: 'ORD-2025-6203',
    status: 'completed',
    depot: 'Boels Depot Rotterdam-Zuid',
    startDate: '10 Jan 2025',
    endDate: '17 Jan 2025',
    items: [
      { name: 'Aluminium Scaffolding Tower 4m', qty: 2, days: 7, total: 240 },
      { name: 'Airless Paint Sprayer 3L/min', qty: 1, days: 7, total: 145 },
    ],
    total: 385,
    paid: true,
  },
  {
    id: 'ORD-2024-9988',
    status: 'completed',
    depot: 'Boels Depot Amsterdam-Noord',
    startDate: '5 Dec 2024',
    endDate: '6 Dec 2024',
    items: [{ name: 'Rotating Laser Level Kit', qty: 1, days: 1, total: 28 }],
    total: 28,
    paid: true,
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2025-5001',
    orderId: 'ORD-2025-8821',
    status: 'open',
    amount: 1022.45,
    issueDate: '15 Apr 2025',
    dueDate: '6 May 2025',
  },
  {
    id: 'INV-2025-4780',
    orderId: 'ORD-2025-7614',
    status: 'overdue',
    amount: 187.25,
    issueDate: '2 Mar 2025',
    dueDate: '23 Mar 2025',
  },
  {
    id: 'INV-2025-3912',
    orderId: 'ORD-2025-6203',
    status: 'paid',
    amount: 465.85,
    issueDate: '10 Jan 2025',
    dueDate: '31 Jan 2025',
    paidDate: '28 Jan 2025',
  },
  {
    id: 'INV-2024-8871',
    orderId: 'ORD-2024-9988',
    status: 'paid',
    amount: 33.88,
    issueDate: '5 Dec 2024',
    dueDate: '26 Dec 2024',
    paidDate: '10 Dec 2024',
  },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-2025-441',
    subject: 'Mini Excavator hydraulic leak on ORD-2025-8821',
    status: 'open',
    priority: 'high',
    createdDate: '17 Apr 2025',
    updatedDate: '17 Apr 2025',
    category: 'Equipment Issue',
    messages: [
      {
        from: 'customer',
        text: 'The hydraulic arm on the mini excavator is leaking oil. The machine is currently on-site. Please advise.',
        date: '17 Apr 2025, 09:12',
      },
      {
        from: 'support',
        text: 'Thank you for reporting this. A technician has been dispatched and will visit your site today between 14:00–17:00. Please keep the machine stopped until then.',
        date: '17 Apr 2025, 10:45',
      },
    ],
  },
  {
    id: 'TKT-2025-288',
    subject: 'Invoice INV-2025-3912 — request for payment extension',
    status: 'resolved',
    priority: 'medium',
    createdDate: '25 Jan 2025',
    updatedDate: '28 Jan 2025',
    category: 'Billing',
    messages: [
      {
        from: 'customer',
        text: 'We would like to request a 2-week payment extension on invoice INV-2025-3912.',
        date: '25 Jan 2025, 14:00',
      },
      {
        from: 'support',
        text: 'Payment extension approved — new due date is 14 February 2025. Updated invoice attached.',
        date: '28 Jan 2025, 09:30',
      },
    ],
  },
  {
    id: 'TKT-2024-903',
    subject: 'Laser level tripod missing from return kit',
    status: 'closed',
    priority: 'low',
    createdDate: '7 Dec 2024',
    updatedDate: '9 Dec 2024',
    category: 'Equipment Issue',
    messages: [
      {
        from: 'customer',
        text: 'When we returned the laser level, the depot said the tripod was missing. We returned everything as received.',
        date: '7 Dec 2024, 11:00',
      },
      {
        from: 'support',
        text: 'We have reviewed the return and found the tripod in a different return bay. No additional charge will be applied. Sorry for the confusion.',
        date: '9 Dec 2024, 14:15',
      },
    ],
  },
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'CLM-2025-098',
    equipment: 'Floor Sander Belt 250mm',
    orderId: 'ORD-2025-6203',
    status: 'under_review',
    type: 'damage',
    description:
      'Sanding belt housing cracked during normal use. Machine was not dropped or misused.',
    submittedDate: '18 Jan 2025',
  },
  {
    id: 'CLM-2025-071',
    equipment: 'Concrete Mixer 160L',
    orderId: 'ORD-2025-7614',
    status: 'resolved',
    type: 'malfunction',
    description: 'Motor stopped working after 2 hours of use. Drum no longer rotates.',
    submittedDate: '3 Mar 2025',
    resolution: 'Replacement unit delivered on 4 Mar 2025. Claim closed.',
  },
];

const STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  open: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

function Badge({ status, label }: { status: string; label?: string }) {
  const cls = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-600';
  const display = label ?? status.replace('_', ' ');
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {display}
    </span>
  );
}

function downloadInvoicePDF(invoice: Invoice, customer: AccountViewProps['customer']) {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;

    doc.setFillColor(255, 102, 0);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('BOELS', margin, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Rental Portal · Invoice', margin, 30);
    doc.setFontSize(9);
    doc.text('TAX INVOICE', pageW - margin, 14, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.id, pageW - margin, 22, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issued: ${invoice.issueDate}`, pageW - margin, 30, { align: 'right' });

    let y = 50;
    doc.setFillColor(245, 246, 250);
    doc.roundedRect(margin, y, contentW / 2 - 3, 32, 2, 2, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(13, 27, 42);
    doc.setFontSize(9);
    doc.text(customer.name, margin + 4, y + 14);
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(customer.company, margin + 4, y + 20);
    doc.text(`Customer ID: ${customer.id}`, margin + 4, y + 26);

    doc.setFillColor(245, 246, 250);
    doc.roundedRect(margin + contentW / 2 + 3, y, contentW / 2 - 3, 32, 2, 2, 'F');
    const col2x = margin + contentW / 2 + 7;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', col2x, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(13, 27, 42);
    doc.setFontSize(9);
    doc.text(`Order: ${invoice.orderId}`, col2x, y + 14);
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    if (invoice.dueDate) doc.text(`Due: ${invoice.dueDate}`, col2x, y + 20);
    doc.text(
      `Status: ${invoice.status.toUpperCase()}`,
      col2x,
      y + 26
    );

    y += 48;
    doc.setFillColor(13, 27, 42);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 3, y + 5.5);
    doc.text('AMOUNT', pageW - margin - 3, y + 5.5, { align: 'right' });

    y += 12;
    doc.setTextColor(13, 27, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rental Equipment — ${invoice.orderId}`, margin + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`€${(invoice.amount / 1.21).toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });

    y += 8;
    doc.text('VAT 21%', margin + 3, y);
    doc.text(`€${(invoice.amount - invoice.amount / 1.21).toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });

    y += 5;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageW - margin, y);
    y += 7;
    doc.setTextColor(13, 27, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin + 3, y);
    doc.setTextColor(255, 102, 0);
    doc.text(`€${invoice.amount.toFixed(2)}`, pageW - margin - 3, y, { align: 'right' });

    y += 20;
    doc.setFillColor(245, 246, 250);
    doc.roundedRect(margin, y, contentW, 20, 2, 2, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('IBAN: NL91 ABNA 0417 1643 00 · BIC: ABNANL2A · Boels Verhuur B.V.', margin + 4, y + 12);
    doc.text(`Reference: ${invoice.id}`, margin + 4, y + 17);

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 282, pageW, 15, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text('Boels Rental · www.boels.com · +31 (0) 88 222 0000', pageW / 2, 290, { align: 'center' });

    doc.save(`Boels-Invoice-${invoice.id}.pdf`);
  });
}

export default function AccountView({ customer, dispatch }: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newClaimOpen, setNewClaimOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Equipment Issue', message: '' });
  const [newClaim, setNewClaim] = useState({ equipment: '', orderId: '', type: 'damage' as Claim['type'], description: '' });
  const [replyText, setReplyText] = useState('');

  const activeOrder = MOCK_ORDERS.find(o => o.status === 'active');
  const openInvoices = MOCK_INVOICES.filter(i => i.status === 'open' || i.status === 'overdue');
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const pendingClaims = claims.filter(c => c.status === 'submitted' || c.status === 'under_review');

  function submitTicket() {
    if (!newTicket.subject || !newTicket.message) return;
    const t: Ticket = {
      id: `TKT-2025-${Math.floor(Math.random() * 900) + 100}`,
      subject: newTicket.subject,
      status: 'open',
      priority: 'medium',
      createdDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: newTicket.category,
      messages: [{ from: 'customer', text: newTicket.message, date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }],
    };
    setTickets(prev => [t, ...prev]);
    setNewTicket({ subject: '', category: 'Equipment Issue', message: '' });
    setNewTicketOpen(false);
    setActiveTab('tickets');
    setExpandedTicket(t.id);
  }

  function submitClaim() {
    if (!newClaim.equipment || !newClaim.description) return;
    const c: Claim = {
      id: `CLM-2025-${Math.floor(Math.random() * 900) + 100}`,
      equipment: newClaim.equipment,
      orderId: newClaim.orderId || 'N/A',
      status: 'submitted',
      type: newClaim.type,
      description: newClaim.description,
      submittedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setClaims(prev => [c, ...prev]);
    setNewClaim({ equipment: '', orderId: '', type: 'damage', description: '' });
    setNewClaimOpen(false);
    setActiveTab('claims');
  }

  function addReply(ticketId: string) {
    if (!replyText.trim()) return;
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  from: 'customer' as const,
                  text: replyText,
                  date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                },
              ],
              updatedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            }
          : t
      )
    );
    setReplyText('');
  }

  const tabs: { id: Tab; label: string; emoji: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
    { id: 'orders', label: 'Orders', emoji: '📦', badge: activeOrder ? 1 : 0 },
    { id: 'invoices', label: 'Invoices', emoji: '🧾', badge: openInvoices.length },
    { id: 'tickets', label: 'Support', emoji: '🎫', badge: openTickets.length },
    { id: 'claims', label: 'Claims', emoji: '⚠️', badge: pendingClaims.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-boels-dark text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 bg-boels-orange rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black">{customer.name}</h1>
          <p className="text-gray-300 text-sm">{customer.company}</p>
          <p className="text-boels-orange text-xs font-mono mt-0.5">{customer.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
          >
            ← Back to Catalog
          </button>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="px-4 py-2 bg-white/10 hover:bg-red-500/60 rounded-xl text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-boels-orange text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {!!tab.badge && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-boels-orange text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Orders', value: MOCK_ORDERS.filter(o => o.status === 'active').length, emoji: '📦', color: 'text-blue-600' },
              { label: 'Open Invoices', value: openInvoices.length, emoji: '🧾', color: openInvoices.some(i => i.status === 'overdue') ? 'text-red-600' : 'text-orange-600' },
              { label: 'Support Tickets', value: openTickets.length, emoji: '🎫', color: 'text-purple-600' },
              { label: 'Pending Claims', value: pendingClaims.length, emoji: '⚠️', color: 'text-yellow-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {activeOrder && (
            <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-boels-dark flex items-center gap-2">
                  <span>📦</span> Active Rental
                </h3>
                <Badge status="active" />
              </div>
              <p className="text-sm font-mono text-boels-orange">{activeOrder.id}</p>
              <p className="text-sm text-gray-500 mt-1">{activeOrder.depot}</p>
              <p className="text-xs text-gray-400 mt-0.5">{activeOrder.startDate} → {activeOrder.endDate}</p>
              <div className="mt-3 space-y-1">
                {activeOrder.items.map(item => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} ×{item.qty}</span>
                    <span className="font-medium text-boels-dark">€{item.total}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-bold text-boels-dark">Total</span>
                <span className="font-bold text-boels-orange">€{activeOrder.total}</span>
              </div>
            </div>
          )}

          {openInvoices.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm">
              <h3 className="font-bold text-boels-dark flex items-center gap-2 mb-3">
                <span>🧾</span> Outstanding Invoices
              </h3>
              <div className="space-y-2">
                {openInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-mono text-boels-dark">{inv.id}</p>
                      {inv.dueDate && <p className="text-xs text-gray-400">Due {inv.dueDate}</p>}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge status={inv.status} />
                      <span className="font-bold text-boels-dark">€{inv.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { setNewTicketOpen(true); setActiveTab('tickets'); }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:border-boels-orange transition-colors group"
            >
              <div className="text-2xl mb-1">🎫</div>
              <p className="font-semibold text-boels-dark group-hover:text-boels-orange">Open Support Ticket</p>
              <p className="text-xs text-gray-400 mt-0.5">Equipment issues, billing questions, general support</p>
            </button>
            <button
              onClick={() => { setNewClaimOpen(true); setActiveTab('claims'); }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:border-boels-orange transition-colors group"
            >
              <div className="text-2xl mb-1">⚠️</div>
              <p className="font-semibold text-boels-dark group-hover:text-boels-orange">File Damage Claim</p>
              <p className="text-xs text-gray-400 mt-0.5">Report equipment damage, loss, or malfunction</p>
            </button>
          </div>
        </div>
      )}

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h2 className="font-black text-boels-dark text-lg">Rental Orders</h2>
          {MOCK_ORDERS.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-boels-dark">{order.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.depot}</p>
                    <p className="text-xs text-gray-400">{order.startDate}{order.endDate ? ` → ${order.endDate}` : ''}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge status={order.status} />
                    <span className="font-bold text-boels-dark">€{order.total}</span>
                    <span className="text-xs text-gray-400">{expandedOrder === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase">
                        <th className="text-left py-1">Equipment</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-center py-1">Days</th>
                        <th className="text-right py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.name} className="border-t border-gray-50">
                          <td className="py-2 text-boels-dark">{item.name}</td>
                          <td className="py-2 text-center text-gray-500">{item.qty}×</td>
                          <td className="py-2 text-center text-gray-500">{item.days}d</td>
                          <td className="py-2 text-right font-bold text-boels-orange">€{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-3 flex gap-2">
                    {order.status === 'active' && (
                      <button
                        onClick={() => { setNewTicketOpen(true); setActiveTab('tickets'); }}
                        className="text-xs text-boels-orange hover:underline"
                      >
                        Report issue with this order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-3">
          <h2 className="font-black text-boels-dark text-lg">Invoices</h2>
          {MOCK_INVOICES.map(inv => (
            <div key={inv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-boels-dark">{inv.id}</p>
                  <p className="text-xs text-gray-500">Order: {inv.orderId}</p>
                  <p className="text-xs text-gray-400">
                    Issued {inv.issueDate}
                    {inv.dueDate && ` · Due ${inv.dueDate}`}
                    {inv.paidDate && ` · Paid ${inv.paidDate}`}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge status={inv.status} />
                  <span className="font-bold text-boels-dark text-base">€{inv.amount.toFixed(2)}</span>
                  <button
                    onClick={() => downloadInvoicePDF(inv, customer)}
                    className="text-xs text-boels-orange hover:underline flex items-center gap-1"
                  >
                    📥 Download PDF
                  </button>
                </div>
              </div>
              {(inv.status === 'open' || inv.status === 'overdue') && (
                <div className={`mt-3 rounded-lg p-3 text-sm ${inv.status === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                  {inv.status === 'overdue'
                    ? '⚠️ This invoice is overdue. Please contact your account manager or pay via bank transfer.'
                    : `📅 Payment due by ${inv.dueDate}. Use reference ${inv.id} when paying.`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-boels-dark text-lg">Support Tickets</h2>
            <button
              onClick={() => setNewTicketOpen(!newTicketOpen)}
              className="bg-boels-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-boels-orange-dark transition-colors"
            >
              + New Ticket
            </button>
          </div>

          {newTicketOpen && (
            <div className="bg-orange-50 border border-boels-orange/30 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-boels-dark">New Support Ticket</h3>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={e => setNewTicket(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange bg-white"
                >
                  {['Equipment Issue', 'Billing', 'Delivery / Collection', 'General Enquiry'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                <input
                  value={newTicket.subject}
                  onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitTicket}
                  className="bg-boels-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-boels-orange-dark transition-colors"
                >
                  Submit Ticket
                </button>
                <button
                  onClick={() => setNewTicketOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-boels-orange">{ticket.id}</p>
                        <Badge status={ticket.status} />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-600' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {ticket.priority} priority
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-boels-dark mt-1 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.category} · Updated {ticket.updatedDate}</p>
                    </div>
                    <span className="text-gray-400 text-sm flex-shrink-0">{expandedTicket === ticket.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedTicket === ticket.id && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="space-y-3 mt-3">
                      {ticket.messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-3 text-sm ${
                            msg.from === 'support'
                              ? 'bg-blue-50 border border-blue-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <p className={`text-xs font-bold mb-1 ${msg.from === 'support' ? 'text-blue-600' : 'text-gray-500'}`}>
                            {msg.from === 'support' ? '🎧 Boels Support' : `👤 ${customer.name}`}
                          </p>
                          <p className="text-gray-700">{msg.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.date}</p>
                        </div>
                      ))}
                    </div>
                    {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addReply(ticket.id)}
                          placeholder="Add a reply..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                        />
                        <button
                          onClick={() => addReply(ticket.id)}
                          className="bg-boels-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-boels-orange-dark transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-boels-dark text-lg">Damage & Loss Claims</h2>
            <button
              onClick={() => setNewClaimOpen(!newClaimOpen)}
              className="bg-boels-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-boels-orange-dark transition-colors"
            >
              + File Claim
            </button>
          </div>

          {newClaimOpen && (
            <div className="bg-orange-50 border border-boels-orange/30 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-boels-dark">File a Claim</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Equipment Name</label>
                  <input
                    value={newClaim.equipment}
                    onChange={e => setNewClaim(p => ({ ...p, equipment: e.target.value }))}
                    placeholder="e.g. Concrete Mixer 160L"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Order Reference</label>
                  <input
                    value={newClaim.orderId}
                    onChange={e => setNewClaim(p => ({ ...p, orderId: e.target.value }))}
                    placeholder="e.g. ORD-2025-8821"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Claim Type</label>
                <select
                  value={newClaim.type}
                  onChange={e => setNewClaim(p => ({ ...p, type: e.target.value as Claim['type'] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange bg-white"
                >
                  <option value="damage">Damage during use</option>
                  <option value="malfunction">Equipment malfunction</option>
                  <option value="loss">Loss / theft</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                <textarea
                  value={newClaim.description}
                  onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what happened in detail..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitClaim}
                  className="bg-boels-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-boels-orange-dark transition-colors"
                >
                  Submit Claim
                </button>
                <button
                  onClick={() => setNewClaimOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {claims.map(claim => (
              <div key={claim.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-mono text-xs text-boels-orange">{claim.id}</p>
                      <Badge status={claim.status} />
                      <span className="text-xs text-gray-400 capitalize">{claim.type}</span>
                    </div>
                    <p className="font-semibold text-sm text-boels-dark">{claim.equipment}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Order: {claim.orderId} · Submitted {claim.submittedDate}</p>
                    <p className="text-sm text-gray-600 mt-2">{claim.description}</p>
                    {claim.resolution && (
                      <div className="mt-2 bg-green-50 border border-green-100 rounded-lg p-2 text-xs text-green-700">
                        ✅ <strong>Resolution:</strong> {claim.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
