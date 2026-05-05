'use client';

import { AppState } from '@/app/page';

interface HeaderProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  cartCount: number;
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: 'catalog' | 'quote' | 'account' }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'TOGGLE_AI' }
  | { type: 'TOGGLE_LOGIN' }
  | { type: 'LOGIN'; payload: { name: string; id: string; company: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: { productId: string } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_DURATION'; payload: { productId: string; days: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_QUOTE' };

export default function Header({ state, dispatch, cartCount }: HeaderProps) {
  return (
    <header className="bg-boels-dark text-white sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Logo */}
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="bg-boels-orange rounded px-3 py-1.5 font-black text-xl tracking-tight">
            BOELS
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight">Rental Portal</div>
            <div className="text-xs text-gray-400 leading-tight">Depot Self-Service</div>
          </div>
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={state.search}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              placeholder="Search equipment..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-boels-orange focus:bg-white/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant button */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AI' })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              state.aiOpen
                ? 'bg-boels-orange text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="AI Assistant"
          >
            <span className="text-base">🤖</span>
            <span className="hidden sm:inline">AI Help</span>
          </button>

          {/* Cart button */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              state.cartOpen
                ? 'bg-boels-orange text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="text-base">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-boels-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login / Account button */}
          <button
            onClick={() =>
              state.customer
                ? dispatch({ type: 'SET_VIEW', payload: 'account' })
                : dispatch({ type: 'TOGGLE_LOGIN' })
            }
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-boels-orange hover:bg-boels-orange-dark text-white text-sm font-medium transition-all"
          >
            <span className="text-base">{state.customer ? '👤' : '🔑'}</span>
            <span className="hidden sm:inline">
              {state.customer ? state.customer.name.split(' ')[0] : 'Login'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <input
          type="text"
          value={state.search}
          onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          placeholder="Search equipment..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-boels-orange"
        />
      </div>
    </header>
  );
}
