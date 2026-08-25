import axios from 'axios';

export interface ShopifyVariantOption {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  price: string;
}

export async function listShopifyVariants(
  storeUrl: string,
  accessToken: string
): Promise<ShopifyVariantOption[]> {
  const response = await axios.get(`https://${storeUrl}/admin/api/2024-01/products.json?limit=100`, {
    headers: { 'X-Shopify-Access-Token': accessToken },
  });

  const products = response.data.products || [];
  const options: ShopifyVariantOption[] = [];

  for (const product of products) {
    for (const variant of product.variants || []) {
      options.push({
        variantId: String(variant.id),
        productTitle: product.title,
        variantTitle: variant.title,
        price: variant.price,
      });
    }
  }

  return options;
}

export async function updateShopifyVariantPrice(
  storeUrl: string,
  accessToken: string,
  variantId: string,
  newPrice: number
): Promise<void> {
  await axios.put(
    `https://${storeUrl}/admin/api/2024-01/variants/${variantId}.json`,
    { variant: { id: Number(variantId), price: newPrice.toFixed(2) } },
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  );
}
