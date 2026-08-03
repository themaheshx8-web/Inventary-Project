/**
 * Application Controller & UI State Management
 */

let currentActiveBoxId = null;
let pendingDeleteAction = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = await checkAuthSession(false);
  if (!session) return;

  // Display user email
  document.getElementById('user-email').innerText = session.user.email;

  // Initial dashboard load
  loadDashboardData();

  // Attach event handlers
  setupEventListeners();
});

// Load stats and box grid
async function loadDashboardData(searchQuery = '') {
  const boxes = await getBoxes();
  
  let totalProductsCount = 0;
  let totalQuantityCount = 0;

  boxes.forEach(b => {
    if (b.products) {
      totalProductsCount += b.products.length;
      totalQuantityCount += b.products.reduce((acc, p) => acc + (p.quantity || 0), 0);
    }
  });

  // Update DOM stats
  document.getElementById('stat-boxes').innerText = boxes.length;
  document.getElementById('stat-products').innerText = totalProductsCount;
  document.getElementById('stat-quantity').innerText = totalQuantityCount;

  // Filter if search query exists
  const filteredBoxes = searchQuery
    ? boxes.filter(b => b.box_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : boxes;

  renderBoxesGrid(filteredBoxes);
}

// Render Boxes
function renderBoxesGrid(boxes) {
  const grid = document.getElementById('boxes-grid');
  const emptyState = document.getElementById('boxes-empty-state');
  
  grid.innerHTML = '';

  if (boxes.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  boxes.forEach(box => {
    const itemCount = box.products ? box.products.length : 0;
    const totalQty = box.products ? box.products.reduce((a, b) => a + b.quantity, 0) : 0;

    const card = document.createElement('div');
    card.className = 'card box-card';
    card.innerHTML = `
      <div>
        <div class="box-card-header">
          <div class="box-title">${escapeHtml(box.box_name)}</div>
        </div>
        <div class="box-meta">${itemCount} unique items (${totalQty} units)</div>
      </div>
      <div class="box-actions">
        <button class="btn btn-primary btn-sm btn-block" onclick="openBoxModal('${box.id}', '${escapeHtml(box.box_name)}')">Open</button>
        <button class="btn btn-secondary btn-sm" onclick="openEditBoxModal('${box.id}', '${escapeHtml(box.box_name)}')">Rename</button>
        <button class="btn btn-danger btn-sm" onclick="promptDeleteBox('${box.id}')">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Utility HTML escape
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Event Listeners setup
function setupEventListeners() {
  // Search
  document.getElementById('search-input').addEventListener('input', (e) => {
    loadDashboardData(e.target.value.trim());
  });

  // Modal Close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });
  });

  // Create Box button click
  document.getElementById('create-box-btn').addEventListener('click', () => {
    document.getElementById('box-modal-title').innerText = 'Create New Box';
    document.getElementById('box-id-input').value = '';
    document.getElementById('box-name-input').value = '';
    document.getElementById('box-modal').classList.remove('hidden');
  });

  // Box form submit
  document.getElementById('box-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('box-id-input').value;
    const name = document.getElementById('box-name-input').value.trim();

    try {
      if (id) {
        await updateBox(id, name);
        showToast('Box renamed!');
      } else {
        await createBox(name);
        showToast('Box created!');
      }
      document.getElementById('box-modal').classList.add('hidden');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Close Product Form modal
  document.getElementById('close-product-form-btn').addEventListener('click', () => {
    document.getElementById('product-form-modal').classList.add('hidden');
  });

  // Product form submit
  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id-input').value;
    const boxId = document.getElementById('product-box-id-input').value;
    const name = document.getElementById('product-name-input').value.trim();
    const qty = document.getElementById('product-qty-input').value;

    try {
      if (id) {
        await updateProduct(id, name, qty);
        showToast('Product updated!');
      } else {
        await createProduct(name, qty, boxId);
        showToast('Product added!');
      }
      document.getElementById('product-form-modal').classList.add('hidden');
      refreshProductList(boxId);
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Confirmation dialog actions
  document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
  });

  document.getElementById('confirm-proceed-btn').addEventListener('click', async () => {
    if (pendingDeleteAction) {
      await pendingDeleteAction();
      pendingDeleteAction = null;
    }
    document.getElementById('confirm-modal').classList.add('hidden');
  });
}

// Global modal triggers
window.openEditBoxModal = function(id, name) {
  document.getElementById('box-modal-title').innerText = 'Rename Box';
  document.getElementById('box-id-input').value = id;
  document.getElementById('box-name-input').value = name;
  document.getElementById('box-modal').classList.remove('hidden');
};

window.promptDeleteBox = function(id) {
  document.getElementById('confirm-title').innerText = 'Delete Box?';
  document.getElementById('confirm-message').innerText = 'This will permanently remove the box and all items inside.';
  pendingDeleteAction = async () => {
    try {
      await deleteBox(id);
      showToast('Box deleted!');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  document.getElementById('confirm-modal').classList.remove('hidden');
};

window.openBoxModal = async function(boxId, boxName) {
  currentActiveBoxId = boxId;
  document.getElementById('modal-box-title').innerText = boxName;
  document.getElementById('products-modal').classList.remove('hidden');
  
  document.getElementById('add-product-btn').onclick = () => {
    document.getElementById('product-modal-title').innerText = 'Add Product';
    document.getElementById('product-id-input').value = '';
    document.getElementById('product-box-id-input').value = boxId;
    document.getElementById('product-name-input').value = '';
    document.getElementById('product-qty-input').value = 1;
    document.getElementById('product-form-modal').classList.remove('hidden');
  };

  refreshProductList(boxId);
};

async function refreshProductList(boxId) {
  const products = await getProductsByBox(boxId);
  const tbody = document.getElementById('products-table-body');
  const emptyState = document.getElementById('products-empty-state');
  
  tbody.innerHTML = '';

  if (products.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.product_name)}</strong></td>
      <td>${p.quantity}</td>
      <td class="text-right">
        <button class="btn btn-secondary btn-sm" onclick="openEditProductModal('${p.id}', '${escapeHtml(p.product_name)}', ${p.quantity}, '${boxId}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="promptDeleteProduct('${p.id}', '${boxId}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.openEditProductModal = function(id, name, qty, boxId) {
  document.getElementById('product-modal-title').innerText = 'Edit Product';
  document.getElementById('product-id-input').value = id;
  document.getElementById('product-box-id-input').value = boxId;
  document.getElementById('product-name-input').value = name;
  document.getElementById('product-qty-input').value = qty;
  document.getElementById('product-form-modal').classList.remove('hidden');
};

window.promptDeleteProduct = function(productId, boxId) {
  document.getElementById('confirm-title').innerText = 'Delete Product?';
  document.getElementById('confirm-message').innerText = 'Are you sure you want to remove this item?';
  pendingDeleteAction = async () => {
    try {
      await deleteProduct(productId);
      showToast('Product removed!');
      refreshProductList(boxId);
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  document.getElementById('confirm-modal').classList.remove('hidden');
};
