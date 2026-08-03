/**
 * Box Database CRUD Operations
 */

// Fetch all boxes
async function getBoxes() {
  const { data, error } = await supabase
    .from('boxes')
    .select('*, products(id, quantity)')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Failed to fetch boxes', 'error');
    return [];
  }
  return data;
}

// Create box
async function createBox(box_name) {
  const { data, error } = await supabase
    .from('boxes')
    .insert([{ box_name }])
    .select();

  if (error) throw error;
  return data[0];
}

// Rename box
async function updateBox(id, box_name) {
  const { data, error } = await supabase
    .from('boxes')
    .update({ box_name })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

// Delete box
async function deleteBox(id) {
  const { error } = await supabase
    .from('boxes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
