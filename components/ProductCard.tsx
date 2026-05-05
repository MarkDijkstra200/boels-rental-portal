'use client';

import { Product } from '@/data/products';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  inCart: boolean;
}

export default function ProductCard({ product, onAddToCart, inCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${product.id}/600/400`;
          }}
        />
        {product.popular && (
          <span className="absolute top-2 left-2 bg-boels-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Popular
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full capitalize">
          {product.category.replace('-', ' ')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-boels-dark text-base leading-tight mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
          {product.specs.slice(0, 4).map(spec => (
            <div key={spec.label} className="text-xs">
              <span className="text-gray-400">{spec.label}: </span>
              <span className="text-gray-700 font-medium">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-4 mt-auto">
          <div>
            <div className="text-2xl font-black text-boels-orange leading-none">
              €{product.dailyRate}
            </div>
            <div className="text-xs text-gray-400">per day</div>
          </div>
          <div className="text-gray-300">|</div>
          <div>
            <div className="text-lg font-bold text-boels-navy leading-none">
              €{product.weeklyRate}
            </div>
            <div className="text-xs text-gray-400">per week</div>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(product.id)}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            inCart
              ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
              : 'bg-boels-orange hover:bg-boels-orange-dark text-white active:scale-95'
          }`}
          disabled={inCart}
        >
          {inCart ? '✓ Added to Cart' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
