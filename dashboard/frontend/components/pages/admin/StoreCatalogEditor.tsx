'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  FIELD_KEYS,
  defaultStoreCatalog,
  parseStoreCatalog,
  type StoreCatalog,
} from '@pms/site-content';
import { useSiteDocumentDraft } from '@/hooks/useSiteDocumentDraft';
import { SiteDocumentEditorShell } from './site-content/SiteDocumentEditorShell';
import { MediaPicker } from './site-content/MediaPicker';

function defaultCategoryId(catalog: StoreCatalog): string {
  const first = catalog.categories.find((c) => c.id !== 'all');
  return first?.id ?? catalog.categories[0]?.id ?? 'mock-exams';
}

function newStoreProduct(catalog: StoreCatalog) {
  const sortOrder = catalog.products.length;
  return {
    id: `product-${Date.now()}`,
    title: 'New product',
    description: '',
    categoryId: defaultCategoryId(catalog),
    price: 0,
    currency: 'USD',
    displayPrice: '$0.00',
    visible: true,
    sortOrder,
  };
}

export function StoreCatalogEditor() {
  const { config, setConfig, baseline, setBaseline, isLoading, loadError, updatedAt } =
    useSiteDocumentDraft(FIELD_KEYS.STORE_CATALOG, defaultStoreCatalog, parseStoreCatalog);

  const addProduct = () => {
    setConfig((c) => ({
      ...c,
      products: [...c.products, newStoreProduct(c)],
    }));
  };

  const removeProduct = (idx: number) => {
    const product = config.products[idx];
    if (
      product &&
      !window.confirm(`Remove "${product.title || product.id}" from the catalog?`)
    ) {
      return;
    }
    setConfig((c) => ({
      ...c,
      products: c.products
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, sortOrder: i })),
    }));
  };

  return (
    <SiteDocumentEditorShell
      fieldKey={FIELD_KEYS.STORE_CATALOG}
      title="Resource store catalog"
      data={config as unknown as Record<string, unknown>}
      setData={setConfig as React.Dispatch<React.SetStateAction<Record<string, unknown>>>}
      baseline={baseline}
      setBaseline={setBaseline}
      isLoading={isLoading}
      loadError={loadError}
      lastSynced={updatedAt}
      publicPreviewPath="/community?view=store"
    >
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {config.products.length} product{config.products.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={addProduct}
            className="text-sm font-bold text-brand-orange flex items-center gap-1"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add product
          </button>
        </div>

        {config.products.length === 0 && (
          <p className="text-sm text-slate-500 py-6 text-center rounded-xl border border-dashed">
            No products yet. Click Add product to create one.
          </p>
        )}

        {config.products.map((product, idx) => (
          <div key={product.id} className="p-4 border rounded-2xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-muted-foreground">{product.id}</span>
              <button
                type="button"
                onClick={() => removeProduct(idx)}
                className="text-xs text-red-500 flex items-center gap-1 font-semibold hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Remove
              </button>
            </div>
            <input
              value={product.title}
              onChange={(e) =>
                setConfig((c) => {
                  const products = [...c.products];
                  products[idx] = { ...products[idx], title: e.target.value };
                  return { ...c, products };
                })
              }
              placeholder="Product title"
              className="w-full border rounded-xl px-3 py-2 text-sm font-bold"
            />
            <textarea
              value={product.description}
              onChange={(e) =>
                setConfig((c) => {
                  const products = [...c.products];
                  products[idx] = { ...products[idx], description: e.target.value };
                  return { ...c, products };
                })
              }
              placeholder="Description"
              className="w-full border rounded-xl px-3 py-2 text-sm h-16"
            />
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">Category</span>
              <select
                value={product.categoryId}
                onChange={(e) =>
                  setConfig((c) => {
                    const products = [...c.products];
                    products[idx] = { ...products[idx], categoryId: e.target.value };
                    return { ...c, products };
                  })
                }
                className="w-full border rounded-xl px-3 py-2 text-sm bg-transparent"
              >
                {config.categories
                  .filter((cat) => cat.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </label>
            <MediaPicker
              label="Product image"
              value={product.image?.url ?? product.imageUrl ?? ''}
              onChange={(url) =>
                setConfig((c) => {
                  const products = [...c.products];
                  const trimmed = url.trim();
                  products[idx] = {
                    ...products[idx],
                    imageUrl: trimmed || undefined,
                    image: trimmed
                      ? {
                          id: `product-img-${product.id}`,
                          url: trimmed,
                          alt: product.title,
                        }
                      : undefined,
                  };
                  return { ...c, products };
                })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase text-muted-foreground">Price (USD)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={product.price}
                  onChange={(e) =>
                    setConfig((c) => {
                      const products = [...c.products];
                      const price = Number(e.target.value) || 0;
                      products[idx] = {
                        ...products[idx],
                        price,
                        displayPrice: `$${price.toFixed(2)}`,
                      };
                      return { ...c, products };
                    })
                  }
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.visible}
                  onChange={(e) =>
                    setConfig((c) => {
                      const products = [...c.products];
                      products[idx] = { ...products[idx], visible: e.target.checked };
                      return { ...c, products };
                    })
                  }
                />
                Visible in store
              </label>
            </div>
          </div>
        ))}
      </GlassCard>
    </SiteDocumentEditorShell>
  );
}
