import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { Modal } from '../../components/feedback/Modal.jsx';
import { useOrganization } from '../../hooks/useOrganization.js';
import { useToast } from '../../hooks/useToast.js';
import { createProduct, createProductVariant, getProducts, updateProduct, deleteProduct, updateProductVariant, deleteProductVariant } from '../../services/product.service.js';
import { formatIndianCurrency } from '../../utils/format.js';

const initialProduct = { name: '', productType: '', salesPrice: '', costPrice: '', description: '' };
const initialVariant = { name: '', sku: '', basePrice: '', priceAdjustment: '', minQuantity: '1' };

function ProductSkeleton() {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-5">
      <Skeleton height="22px" width="35%" />
      <Skeleton height="16px" width="60%" />
      <Skeleton height="48px" />
    </div>
  );
}

export function ProductsPage() {
  const { activeOrg } = useOrganization();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProduct);
  const [variantForm, setVariantForm] = useState(initialVariant);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = useCallback(async () => {
    if (!activeOrg?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getProducts(activeOrg.id);
      setProducts(result.products);
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Could not load this organization’s product catalogue.');
    } finally {
      setLoading(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const submitProduct = async () => {
    if (
      !productForm.name.trim() ||
      !productForm.productType.trim() ||
      productForm.salesPrice === '' ||
      productForm.costPrice === ''
    ) {
      addToast({ type: 'error', title: 'Complete the product details', message: 'Name, type, sales price, and cost price are required.' });
      return;
    }
    setSaving(true);
    try {
      await createProduct(activeOrg.id, {
        name: productForm.name.trim(),
        productType: productForm.productType.trim(),
        salesPrice: Number(productForm.salesPrice),
        costPrice: Number(productForm.costPrice),
        description: productForm.description.trim() || undefined,
      });
      setProductForm(initialProduct);
      setProductModalOpen(false);
      addToast({ type: 'success', title: 'Product created', message: 'You can now add variants and create plans for it.' });
      await loadProducts();
    } catch (requestError) {
      addToast({ type: 'error', title: 'Product was not created', message: requestError.response?.data?.error?.message || 'Check the product details and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const submitVariant = async () => {
    if (!variantProduct || !variantForm.name.trim() || !variantForm.basePrice) return;
    setSaving(true);
    try {
      await createProductVariant(activeOrg.id, variantProduct.id, {
        name: variantForm.name.trim(),
        sku: variantForm.sku.trim() || undefined,
        basePrice: Number(variantForm.basePrice),
        priceAdjustment: variantForm.priceAdjustment === '' ? 0 : Number(variantForm.priceAdjustment),
        minQuantity: Number(variantForm.minQuantity || 1),
      });
      setVariantForm(initialVariant);
      setVariantProduct(null);
      addToast({ type: 'success', title: 'Variant added', message: 'Its price and minimum quantity are ready for plan setup.' });
      await loadProducts();
    } catch (requestError) {
      addToast({ type: 'error', title: 'Variant was not added', message: requestError.response?.data?.error?.message || 'Check the variant values and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const submitEditProduct = async () => {
    if (!editingProduct || !productForm.name.trim() || !productForm.productType.trim() || productForm.salesPrice === '' || productForm.costPrice === '') return;
    setSaving(true);
    try {
      await updateProduct(activeOrg.id, editingProduct.id, { name: productForm.name.trim(), productType: productForm.productType.trim(), salesPrice: Number(productForm.salesPrice), costPrice: Number(productForm.costPrice), description: productForm.description.trim() || undefined });
      setEditingProduct(null); setProductForm(initialProduct); addToast({ type: 'success', title: 'Product updated', message: 'The catalogue record was updated.' }); await loadProducts();
    } catch (requestError) { addToast({ type: 'error', title: 'Product was not updated', message: requestError.response?.data?.error?.message || 'Try again.' }); } finally { setSaving(false); }
  };
  const submitEditVariant = async () => {
    if (!editingVariant || !variantForm.name.trim() || !variantForm.basePrice) return;
    setSaving(true);
    try {
      await updateProductVariant(activeOrg.id, editingVariant.productId, editingVariant.id, { name: variantForm.name.trim(), sku: variantForm.sku.trim() || undefined, basePrice: Number(variantForm.basePrice), priceAdjustment: variantForm.priceAdjustment === '' ? 0 : Number(variantForm.priceAdjustment), minQuantity: Number(variantForm.minQuantity || 1) });
      setEditingVariant(null); setVariantForm(initialVariant); addToast({ type: 'success', title: 'Variant updated', message: 'The variant was updated.' }); await loadProducts();
    } catch (requestError) { addToast({ type: 'error', title: 'Variant was not updated', message: requestError.response?.data?.error?.message || 'Try again.' }); } finally { setSaving(false); }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return; setSaving(true);
    try {
      if (deleteTarget.type === 'product') await deleteProduct(activeOrg.id, deleteTarget.id);
      else await deleteProductVariant(activeOrg.id, deleteTarget.productId, deleteTarget.id);
      addToast({ type: 'success', title: `${deleteTarget.type === 'product' ? 'Product' : 'Variant'} removed`, message: 'The catalogue was refreshed.' }); setDeleteTarget(null); await loadProducts();
    } catch (requestError) { addToast({ type: 'error', title: 'Delete failed', message: requestError.response?.data?.error?.message || 'This record could not be removed.' }); } finally { setSaving(false); }
  };

  const setField = (setter, field) => (event) => setter((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        subtitle="Define subscription products and their billable variants for the active organization."
        actions={
          <Button variant="primary" size="sm" onClick={() => setProductModalOpen(true)} disabled={!activeOrg}>
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Add product
          </Button>
        }
      />

      {!activeOrg && (
        <EmptyState
          icon="lucide:building-2"
          title="Choose an organization first"
          description="Product records are isolated by organization. Create or switch to one before managing its catalogue."
        />
      )}

      {activeOrg && error && <ErrorState message={error} onRetry={loadProducts} className="mb-6" />}

      {activeOrg && !loading && !error && products.length > 0 && <div className="mb-5 flex flex-col gap-3 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Icon icon="lucide:search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or variants" className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-sm" /></div><span className="font-mono text-xs text-muted-foreground">{products.filter((product) => `${product.name} ${product.productType} ${product.variants.map((variant) => variant.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).length} products</span></div>}

      {activeOrg && loading ? (
        <div className="space-y-3"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div>
      ) : activeOrg && !error && products.length === 0 ? (
        <EmptyState
          icon="lucide:package-open"
          title="No products in this catalogue"
          description="Add the first product, then define the variants customers can subscribe to."
          actionLabel="Add product"
          onAction={() => setProductModalOpen(true)}
        />
      ) : activeOrg && !error ? (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Variants</th>
                  <th className="px-4 py-2.5 font-medium">Plans</th>
                  <th className="px-4 py-2.5 font-medium">Availability</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.filter((product) => `${product.name} ${product.productType} ${product.variants.map((variant) => variant.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).map((product) => (
                  <tr key={product.id} className="border-t border-border bg-surface text-sm transition-colors hover:bg-surface-raised">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{product.productType} · {formatIndianCurrency(product.salesPrice)}</div>
                    </td>
                    <td className="px-4 py-3">
                      {product.variants.length === 0 ? (
                        <span className="text-xs text-muted-foreground">None yet</span>
                      ) : (
                        <div className="space-y-1">
                          {product.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                              <span className="text-foreground">{variant.name}</span> · {formatIndianCurrency(variant.basePrice)} {Number(variant.priceAdjustment) !== 0 && `· ${Number(variant.priceAdjustment) > 0 ? '+' : ''}${formatIndianCurrency(variant.priceAdjustment)}`} · min {variant.minQuantity}
                              <button type="button" onClick={() => { setEditingVariant({ ...variant, productId: product.id }); setVariantForm({ name: variant.name, sku: variant.sku || '', basePrice: String(variant.basePrice), priceAdjustment: String(variant.priceAdjustment || ''), minQuantity: String(variant.minQuantity) }); }} className="ml-1 text-primary hover:underline">Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ type: 'variant', ...variant, productId: product.id })} className="text-error hover:underline">Delete</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm tabular-nums text-foreground">{product._count?.plans || 0}</td>
                    <td className="px-4 py-3"><Badge variant={product.isActive ? 'completed' : 'neutral'}>{product.isActive ? 'Available' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setVariantProduct(product)}>
                        <Icon icon="lucide:plus" className="w-3.5 h-3.5" /> Variant
                      </Button>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, productType: product.productType, salesPrice: String(product.salesPrice), costPrice: String(product.costPrice), description: product.description || '' }); }}><Icon icon="lucide:pencil" className="h-3.5 w-3.5" />Edit</Button>
                      <Button variant="ghost" size="sm" className="ml-2 text-error" onClick={() => setDeleteTarget({ type: 'product', ...product })}><Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} title="Add product" description="Products remain inside the active organization." confirmLabel="Create product" onConfirm={submitProduct} isConfirmLoading={saving}>
        <div className="space-y-4">
          <Input label="Product name" required value={productForm.name} onChange={setField(setProductForm, 'name')} placeholder="e.g. Brightloop CRM" />
          <Input label="Product type" required value={productForm.productType} onChange={setField(setProductForm, 'productType')} placeholder="e.g. Business software" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Sales price (₹)" required type="number" min="0" step="0.01" value={productForm.salesPrice} onChange={setField(setProductForm, 'salesPrice')} />
            <Input label="Cost price (₹)" required type="number" min="0" step="0.01" value={productForm.costPrice} onChange={setField(setProductForm, 'costPrice')} />
          </div>
          <Textarea label="Notes" value={productForm.description} onChange={setField(setProductForm, 'description')} placeholder="Internal product notes" rows={3} />
        </div>
      </Modal>

      <Modal isOpen={Boolean(editingProduct)} onClose={() => { setEditingProduct(null); setProductForm(initialProduct); }} title={`Edit ${editingProduct?.name || 'product'}`} description="Update this product’s catalogue details." confirmLabel="Save changes" onConfirm={submitEditProduct} isConfirmLoading={saving}>
        <div className="space-y-4"><Input label="Product name" required value={productForm.name} onChange={setField(setProductForm, 'name')} /><Input label="Product type" required value={productForm.productType} onChange={setField(setProductForm, 'productType')} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Sales price (₹)" required type="number" min="0" step="0.01" value={productForm.salesPrice} onChange={setField(setProductForm, 'salesPrice')} /><Input label="Cost price (₹)" required type="number" min="0" step="0.01" value={productForm.costPrice} onChange={setField(setProductForm, 'costPrice')} /></div><Textarea label="Notes" value={productForm.description} onChange={setField(setProductForm, 'description')} /></div>
      </Modal>

      <Modal isOpen={Boolean(variantProduct)} onClose={() => setVariantProduct(null)} title={`Add variant to ${variantProduct?.name || 'product'}`} description="Set the fixed amount added to the product price and the minimum subscription quantity." confirmLabel="Add variant" onConfirm={submitVariant} isConfirmLoading={saving}>
        <div className="space-y-4">
          <Input label="Variant name" required value={variantForm.name} onChange={setField(setVariantForm, 'name')} placeholder="e.g. Odoo brand" />
          <Input label="SKU" value={variantForm.sku} onChange={setField(setVariantForm, 'sku')} placeholder="Optional internal SKU" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Base price (₹)" required type="number" min="0.01" step="0.01" value={variantForm.basePrice} onChange={setField(setVariantForm, 'basePrice')} />
            <Input label="Price adjustment (₹)" type="number" step="0.01" value={variantForm.priceAdjustment} onChange={setField(setVariantForm, 'priceAdjustment')} helperText="Optional fixed adjustment, such as +₹560." />
          </div>
          <Input label="Minimum quantity" required type="number" min="1" step="1" value={variantForm.minQuantity} onChange={setField(setVariantForm, 'minQuantity')} />
        </div>
      </Modal>
      <Modal isOpen={Boolean(editingVariant)} onClose={() => { setEditingVariant(null); setVariantForm(initialVariant); }} title={`Edit ${editingVariant?.name || 'variant'}`} description="Update this variant’s price and quantity rules." confirmLabel="Save changes" onConfirm={submitEditVariant} isConfirmLoading={saving}>
        <div className="space-y-4"><Input label="Variant name" required value={variantForm.name} onChange={setField(setVariantForm, 'name')} /><Input label="SKU" value={variantForm.sku} onChange={setField(setVariantForm, 'sku')} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Base price (₹)" required type="number" min="0.01" step="0.01" value={variantForm.basePrice} onChange={setField(setVariantForm, 'basePrice')} /><Input label="Price adjustment (₹)" type="number" step="0.01" value={variantForm.priceAdjustment} onChange={setField(setVariantForm, 'priceAdjustment')} /></div><Input label="Minimum quantity" required type="number" min="1" value={variantForm.minQuantity} onChange={setField(setVariantForm, 'minQuantity')} /></div>
      </Modal>
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title={`Delete ${deleteTarget?.type || 'record'}`} description={`Delete “${deleteTarget?.name || ''}”? This action cannot be undone.`} confirmLabel="Delete" confirmVariant="destructive" onConfirm={confirmDelete} isConfirmLoading={saving}><p className="text-sm text-muted-foreground">Products with plans may be rejected by the server. Remove only records that are no longer needed.</p></Modal>
    </div>
  );
}
