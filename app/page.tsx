'use client';

import { useReducer, useMemo } from 'react';
import { PRODUCTS, Product } from '@/data/products';
import Header, { AppAction } from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import AIAssistant from '@/components/AIAssistant';
import LoginModal from '@/components/LoginModal';
import QuoteView from '@/components/QuoteView';
import AccountView from '@/components/AccountView';

export interface CartItem {
  product: Product;
  quantity: number;
  durationDays: number;
}

export interface AppState {
  view: 'catalog' | 'quote' | 'account';
  cart: CartItem[];
  category: string;
  search: string;
  cartOpen: boolean;
  aiOpen: boolean;
  loginOpen: boolean;
  customer: { name: string; id: string; company: string } | null;
  quoteRef: string;
  depot: string;
}

function generateQuoteRef() {
  return `BQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

const initialState: AppState = {
  view: 'catalog',
  cart: [],
  category: 'all',
  search: '',
  cartOpen: false,
  aiOpen: false,
  loginOpen: false,
  customer: null,
  quoteRef: generateQuoteRef(),
  depot: 'Boels Depot Amsterdam-Noord',
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload, cartOpen: false, aiOpen: false };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'TOGGLE_CART':
      return { ...state, cartOpen: !state.cartOpen, aiOpen: false, loginOpen: false };
    case 'TOGGLE_AI':
      return { ...state, aiOpen: !state.aiOpen, cartOpen: false, loginOpen: false };
    case 'TOGGLE_LOGIN':
      return { ...state, loginOpen: !state.loginOpen, cartOpen: false, aiOpen: false };
    case 'LOGIN':
      return { ...state, customer: action.payload, loginOpen: false, view: 'account' };
    case 'LOGOUT':
      return { ...state, customer: null };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.product.id === action.payload.productId);
      if (exists) return state;
      const product = PRODUCTS.find(p => p.id === action.payload.productId);
      if (!product) return state;
      return {
        ...state,
        cart: [...state.cart, { product, quantity: 1, durationDays: 1 }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(i => i.product.id !== action.payload.productId),
      };
    case 'UPDATE_DURATION':
      return {
        ...state,
        cart: state.cart.map(i =>
          i.product.id === action.payload.productId
            ? { ...i, durationDays: action.payload.days }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [], quoteRef: generateQuoteRef() };
    case 'SET_QUOTE':
      return { ...state, view: 'quote', cartOpen: false, quoteRef: generateQuoteRef() };
    default:
      return state;
  }
}

const DEPOT_OPTIONS = [
  'Boels Depot Amsterdam-Noord',
  'Boels Depot Rotterdam-Zuid',
  'Boels Depot Utrecht-Centrum',
  'Boels Depot Den Haag',
  'Boels Depot Eindhoven',
];

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const cartProductIds = useMemo(() => new Set(state.cart.map(i => i.product.id)), [state.cart]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory = state.category === 'all' || p.category === state.category;
      const q = state.search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [state.category, state.search]);

  function handleCreateQuote() {
    if (state.cart.length === 0) return;
    dispatch({ type: 'SET_QUOTE' });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        state={state}
        dispatch={dispatch}
        cartCount={state.cart.length}
      />

      {state.view === 'catalog' && (
        <>
          <CategoryFilter
            selected={state.category}
            onSelect={cat => dispatch({ type: 'SET_CATEGORY', payload: cat })}
          />

          <main className="flex-1 px-4 md:px-6 py-6">
            {/* Page title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl font-black text-boels-dark">
                  {state.search
                    ? `Search results for "${state.search}"`
                    : state.category === 'all'
                    ? 'All Rental Equipment'
                    : PRODUCTS.find(p => p.category === state.category)
                    ? state.category.charAt(0).toUpperCase() + state.category.slice(1).replace('-', ' ')
                    : 'Equipment'}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {/* Depot selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">📍 Depot:</span>
                <select
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-boels-orange"
                  defaultValue={state.depot}
                >
                  {DEPOT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={id => dispatch({ type: 'ADD_TO_CART', payload: { productId: id } })}
                    inCart={cartProductIds.has(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-gray-500">No equipment found</p>
                <p className="text-sm mt-2">
                  Try a different search or{' '}
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_SEARCH', payload: '' });
                      dispatch({ type: 'SET_CATEGORY', payload: 'all' });
                    }}
                    className="text-boels-orange hover:underline"
                  >
                    clear filters
                  </button>
                </p>
              </div>
            )}
          </main>

          {/* Floating cart summary (when items in cart) */}
          {state.cart.length > 0 && !state.cartOpen && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="bg-boels-dark text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:bg-boels-navy transition-colors active:scale-95"
              >
                <span className="text-xl">🛒</span>
                <span className="font-bold">{state.cart.length} item{state.cart.length !== 1 ? 's' : ''} in cart</span>
                <span className="bg-boels-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  View →
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {state.view === 'quote' && (
        <main className="flex-1">
          <QuoteView
            items={state.cart}
            customer={state.customer}
            quoteRef={state.quoteRef}
            depot={state.depot}
            dispatch={dispatch}
          />
        </main>
      )}

      {state.view === 'account' && state.customer && (
        <main className="flex-1">
          <AccountView
            customer={state.customer}
            dispatch={dispatch}
          />
        </main>
      )}

      {/* Overlays */}
      {state.cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
          />
          <CartDrawer
            items={state.cart}
            dispatch={dispatch}
            onCreateQuote={handleCreateQuote}
          />
        </>
      )}

      {state.aiOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => dispatch({ type: 'TOGGLE_AI' })}
          />
          <AIAssistant
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'TOGGLE_AI' })}
          />
        </>
      )}

      {state.loginOpen && (
        <LoginModal
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'TOGGLE_LOGIN' })}
        />
      )}
    </div>
  );
}
