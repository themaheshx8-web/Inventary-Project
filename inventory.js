/**
 * Products Database Operations
 */

// Get products belonging to a specific box ID
async function getProductsByBox(boxId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('box_id', boxId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Add new product
async function createProduct(product_name, quantity, box_id) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ product_name, quantity: parseInt(quantity, 10), box_id }])
    .select();

  if (error) throw error;
  return data[0];
}

// Update existing product
async function updateProduct(id, product_name, quantity) {
  const { data, error } = await supabase
    .from('products')
    .update({ product_name, quantity: parseInt(quantity, 10) })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

// Delete product
async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
