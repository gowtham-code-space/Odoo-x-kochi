import * as service from './products.service.js';

export async function handleListProducts(req, res) {
  const { page, limit, search, isActive } = req.query;
  const result = await service.listProducts(req.organization.id, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    search,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  });
  res.json({ success: true, data: result });
}

export async function handleGetProduct(req, res) {
  const product = await service.getProduct(req.params.id, req.organization.id);
  res.json({ success: true, data: { product } });
}

export async function handleCreateProduct(req, res) {
  const product = await service.createProduct(req.organization.id, req.body);
  res.status(201).json({ success: true, data: { product } });
}

export async function handleUpdateProduct(req, res) {
  const product = await service.updateProduct(req.params.id, req.organization.id, req.body);
  res.json({ success: true, data: { product } });
}

export async function handleDeleteProduct(req, res) {
  await service.deleteProduct(req.params.id, req.organization.id);
  res.json({ success: true, data: { message: 'Product deleted' } });
}

// Variants
export async function handleAddVariant(req, res) {
  const variant = await service.addVariant(req.params.productId, req.organization.id, req.body);
  res.status(201).json({ success: true, data: { variant } });
}

export async function handleEditVariant(req, res) {
  const variant = await service.editVariant(
    req.params.variantId,
    req.params.productId,
    req.organization.id,
    req.body
  );
  res.json({ success: true, data: { variant } });
}

export async function handleDeleteVariant(req, res) {
  await service.removeVariant(req.params.variantId, req.params.productId, req.organization.id);
  res.json({ success: true, data: { message: 'Variant deleted' } });
}
