'use client';

import { useState } from 'react';
import { AppAction } from '@/components/Header';

interface LoginModalProps {
  onClose: () => void;
  dispatch: React.Dispatch<AppAction>;
}

const DEMO_CUSTOMERS = [
  { name: 'Jan de Vries', id: 'B2B-10023', company: 'De Vries Aannemers BV', type: 'B2B' },
  { name: 'Maria Bakker', id: 'B2B-10058', company: 'Bakker Renovaties', type: 'B2B' },
  { name: 'Cash Customer', id: 'CASH-00001', company: 'Walk-in Customer', type: 'Cash' },
];

type Mode = 'select' | 'qr' | 'email';

export default function LoginModal({ onClose, dispatch }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>('select');
  const [qrScanned, setQrScanned] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function loginAs(customer: (typeof DEMO_CUSTOMERS)[0]) {
    dispatch({
      type: 'LOGIN',
      payload: { name: customer.name, id: customer.id, company: customer.company },
    });
    onClose();
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    loginAs(DEMO_CUSTOMERS[0]);
  }

  function simulateQRScan() {
    setQrScanned(true);
    setTimeout(() => loginAs(DEMO_CUSTOMERS[0]), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-boels-dark text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Sign In</h2>
            <p className="text-xs text-gray-300">Access your account and pricing</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['select', 'qr', 'email'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === m
                  ? 'text-boels-orange border-b-2 border-boels-orange'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'select' ? '👥 Demo' : m === 'qr' ? '📱 QR Code' : '✉️ Email'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Demo customer select */}
          {mode === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Select a demo account to continue:</p>
              {DEMO_CUSTOMERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => loginAs(c)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-boels-orange hover:bg-orange-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-boels-orange/10 rounded-full flex items-center justify-center text-lg">
                      {c.type === 'Cash' ? '💵' : '🏢'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-boels-dark">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.company}</p>
                      <p className="text-xs text-boels-orange font-medium">{c.id}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs bg-gray-100 group-hover:bg-boels-orange group-hover:text-white text-gray-500 px-2 py-0.5 rounded-full transition-colors">
                        {c.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* QR Login */}
          {mode === 'qr' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">Scan this code with the Boels app on your phone</p>
              {/* Simulated QR code */}
              <div className="w-48 h-48 mx-auto border-4 border-boels-dark rounded-xl p-3 bg-white">
                <div className="w-full h-full grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48];
                    const inner = [8,9,10,15,16,17,22,23,24];
                    return (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          corners.includes(i) || (Math.random() > 0.4 && !inner.includes(i))
                            ? 'bg-boels-dark'
                            : 'bg-white'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-gray-400">Simulated QR — click below to demo scan</p>
              {!qrScanned ? (
                <button
                  onClick={simulateQRScan}
                  className="bg-boels-orange text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-boels-orange-dark transition-colors"
                >
                  Simulate QR Scan
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <span className="animate-spin">⟳</span> Authenticating...
                </div>
              )}
            </div>
          )}

          {/* Email Login */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jan@devriesaannemers.nl"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-boels-orange text-white py-3 rounded-xl font-bold hover:bg-boels-orange-dark transition-colors"
              >
                Sign In
              </button>
              <p className="text-xs text-center text-gray-400">
                Demo: any email + password will log you in
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
