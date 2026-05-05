'use client';

import { CartItem } from '@/app/page';
import { AppAction } from '@/components/Header';

interface CartDrawerProps {
  items: CartItem[];
  dispatch: React.Dispatch<AppAction>;
  onCreateQuote: () => void;
}

export default function CartDrawer({ items, dispatch, onCreateQuote }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => {
    const rate = item.durationDays >= 7 ? item.product.weeklyRate * Math.ceil(item.durationDays / 7) : item.product.dailyRate * item.durationDays;
    return sum + rate * item.quantity;
  }, 0);

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-boels-dark text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Rental Cart</h2>
          <p className="text-xs text-gray-300">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_CART' })}
          className="text-gray-300 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🛒</div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm mt-1">Browse equipment and add items</p>
          </div>
        ) : (
          items.map(item => {
            const daysToUse = item.durationDays;
            const weeks = Math.floor(daysToUse / 7);
            const remainingDays = daysToUse % 7;
            const lineTotal =
              (weeks * item.product.weeklyRate + remainingDays * item.product.dailyRate) * item.quantity;

            return (
              <div key={item.product.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-200 flex-shrink-0"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        `https://picsum.photos/seed/${item.product.id}/200/200`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-boels-dark leading-tight truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      €{item.product.dailyRate}/day · €{item.product.weeklyRate}/week
                    </p>
                    <p className="text-sm font-bold text-boels-orange mt-1">€{lineTotal.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.product.id } })}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm self-start"
                  >
                    ✕
                  </button>
                </div>

                {/* Duration & Quantity */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium">Rental Duration</label>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_DURATION',
                            payload: { productId: item.product.id, days: Math.max(1, item.durationDays - 1) },
                          })
                        }
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 font-bold text-sm transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-sm font-bold text-boels-dark">{item.durationDays}</span>
                        <span className="text-xs text-gray-500 ml-1">day{item.durationDays !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_DURATION',
                            payload: { productId: item.product.id, days: item.durationDays + 1 },
                          })
                        }
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 font-bold text-sm transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    {item.durationDays >= 7 && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Weekly rate applied (saves {Math.round(((item.product.dailyRate * 7 - item.product.weeklyRate) / (item.product.dailyRate * 7)) * 100)}%)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-xl font-black text-boels-dark">€{subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">* Prices excl. VAT. Final quote includes depot pickup options.</p>
          <button
            onClick={() => {
              dispatch({ type: 'TOGGLE_CART' });
              onCreateQuote();
            }}
            className="w-full bg-boels-orange hover:bg-boels-orange-dark text-white font-bold py-3.5 rounded-xl transition-colors text-base active:scale-95"
          >
            Create Quote →
          </button>
          <button
            onClick={() => dispatch({ type: 'CLEAR_CART' })}
            className="w-full text-gray-400 hover:text-red-500 text-sm transition-colors py-1"
          >
            Clear cart
          </button>
        </div>
      )}
    </div>
  );
}
