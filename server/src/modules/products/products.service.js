import { NotFoundError, ConflictError } from '../../errors/HttpErrors.js';
import * as repo from './products.repository.js';

export async function listProducts(organizationId, query) {
  return repo.findProducts(organizationId, query);
}

export async function getProduct(id, organizationId) {
  const product = await repo.findProductById(id, organizationId);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

export async function createProduct(organizationId, data) {
  return repo.createProduct(organizationId, data);
}

export async function updateProduct(id, organizationId, data) {
  await getProduct(id, organizationId); // verify ownership
  return repo.updateProduct(id, organizationId, data);
}

export async function deleteProduct(id, organizationId) {
  const product = await repo.findProductById(id, organizationId);
  if (!product) throw new NotFoundError('Product not found');
  if (product.plans?.length > 0) {
    throw new ConflictError('Cannot delete a product with active plans. Archive it instead.');
  }
  return repo.deleteProduct(id, organizationId);
}

// Variants
export async function addVariant(productId, organizationId, data) {
  await getProduct(productId, organizationId); // verify product belongs to org
  return repo.createVariant(productId, data);
}

export async function editVariant(variantId, productId, organizationId, data) {
  await getProduct(productId, organizationId);
  const variant = await repo.findVariantById(variantId, productId);
  if (!variant) throw new NotFoundError('Variant not found');
  return repo.updateVariant(variantId, data);
}

export async function removeVariant(variantId, productId, organizationId) {
  await getProduct(productId, organizationId);
  const variant = await repo.findVariantById(variantId, productId);
  if (!variant) throw new NotFoundError('Variant not found');
  return repo.deleteVariant(variantId);
}
