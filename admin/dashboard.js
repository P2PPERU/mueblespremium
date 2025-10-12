// Configuración de la API
const API_URL = 'http://localhost:3000/api';

let products = [];
let editingProductId = null;

// Actualizar estado de conexión
function updateConnectionStatus(connected, message = '') {
  const statusDiv = document.getElementById('connectionStatus');
  if (!statusDiv) return;
  
  if (connected) {
    statusDiv.innerHTML = `
      <div class="w-2 h-2 rounded-full bg-green-500"></div>
      <span class="text-sm text-green-600">✓ Conectado al servidor</span>
    `;
  } else {
    statusDiv.innerHTML = `
      <div class="w-2 h-2 rounded-full bg-red-500"></div>
      <span class="text-sm text-red-600">✕ ${message || 'Sin conexión'}</span>
    `;
  }
}

// Cargar productos desde el backend
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const result = await response.json();
    
    if (result.success) {
      products = result.data;
      renderProducts();
      updateConnectionStatus(true);
    } else {
      showNotification('Error cargando productos', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error conectando con el servidor', 'error');
    updateConnectionStatus(false, 'Error al cargar productos');
  }
}

// Resetear formulario
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('imagePreview').classList.add('hidden');
  editingProductId = null;

  const submitBtn = document.querySelector("#productForm button[type='submit']");
  submitBtn.textContent = "➕ Agregar producto";
  submitBtn.classList.remove("bg-green-600", "hover:bg-green-700");
  submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700");

  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.remove();
  }
}

// Eliminar producto
async function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  
  if (!confirm(`¿Estás seguro de eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showNotification(result.message, 'success');
      await loadProducts();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error eliminando producto', 'error');
  }
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer') || createNotificationContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type} transform transition-all duration-300 ease-in-out`;
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  notification.innerHTML = `
    <div class="flex items-center gap-3 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg">
      <span class="text-2xl">${icons[type]}</span>
      <span class="font-medium">${message}</span>
    </div>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notificationContainer';
  container.className = 'fixed top-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

// Exportar productos a JSON
async function exportProducts() {
  try {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Productos exportados correctamente', 'success');
  } catch (error) {
    showNotification('Error exportando productos', 'error');
  }
}

// Renderizar lista de productos
function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = `
      <li class='p-8 text-gray-500 text-center bg-white rounded-lg'>
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p class="mt-2 font-medium">No hay productos</p>
        <p class="text-sm">Agrega tu primer producto usando el formulario de arriba</p>
      </li>
    `;
    return;
  }

  products.forEach((p) => {
    const discount = Math.round(((p.old_price - p.price) / p.old_price) * 100);
    const imgUrl = p.img_url ? `${API_URL.replace('/api', '')}${p.img_url}` : 'https://via.placeholder.com/200x200?text=Sin+Imagen';
    
    list.innerHTML += `
      <li class="p-4 bg-white shadow rounded-lg flex items-center justify-between gap-4 hover:shadow-md transition">
        <div class="flex items-center gap-4 flex-1">
          <img src="${imgUrl}" alt="${p.name}" class="w-24 h-24 object-cover rounded-lg border-2 border-gray-200">
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">${p.name}</h3>
            <p class="text-sm text-gray-600 mt-1">
              <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${getLevelColor(p.level)}">
                Nivel ${p.level}
              </span>
              <span class="ml-2">${p.dimensions}</span>
            </p>
            <div class="flex gap-2 items-center mt-2">
              <span class="text-xl font-bold text-indigo-600">S/ ${p.price.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
              <span class="text-sm text-gray-500 line-through">S/ ${p.old_price.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">-${discount}%</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="editProduct(${p.id})" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition">
            ✏️ Editar
          </button>
          <button onclick="deleteProduct(${p.id})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition">
            🗑️ Eliminar
          </button>
        </div>
      </li>
    `;
  });
}

// Obtener color según nivel
function getLevelColor(level) {
  const colors = {
    'A': 'bg-indigo-100 text-indigo-800',
    'B': 'bg-yellow-100 text-yellow-800',
    'C': 'bg-red-100 text-red-800'
  };
  return colors[level] || colors['A'];
}

// Manejar envío del formulario
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  
  // Campos básicos
  formData.append('name', document.getElementById("name").value);
  formData.append('price', document.getElementById("price").value);
  formData.append('old_price', document.getElementById("oldPrice").value);
  formData.append('level', document.getElementById("level").value);
  formData.append('dimensions', document.getElementById("dimensions").value);

  // Campos adicionales (si existen)
  const shortDesc = document.getElementById("shortDescription")?.value;
  const description = document.getElementById("description")?.value;
  const material = document.getElementById("material")?.value;
  const color = document.getElementById("color")?.value;
  const weight = document.getElementById("weight")?.value;
  const stock = document.getElementById("stock")?.value;
  const assemblyTime = document.getElementById("assemblyTime")?.value;
  const warranty = document.getElementById("warranty")?.value;
  const isFeatured = document.getElementById("isFeatured")?.checked;

  if (shortDesc) formData.append('short_description', shortDesc);
  if (description) formData.append('description', description);
  if (material) formData.append('material', material);
  if (color) formData.append('color', color);
  if (weight) formData.append('weight', weight);
  if (stock) formData.append('stock', stock);
  if (assemblyTime) formData.append('assembly_time', assemblyTime);
  if (warranty) formData.append('warranty', warranty);
  if (isFeatured) formData.append('is_featured', isFeatured);

  // Imágenes múltiples
  const imgFiles = document.getElementById("imgFile").files;
  if (imgFiles.length > 0) {
    for (let i = 0; i < imgFiles.length; i++) {
      formData.append('images', imgFiles[i]);
    }
  }

  try {
    let response;
    if (editingProductId) {
      // Actualizar producto existente
      response = await fetch(`${API_URL}/products/${editingProductId}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      // Crear nuevo producto
      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        body: formData
      });
    }

    const result = await response.json();

    if (result.success) {
      showNotification(result.message, 'success');
      e.target.reset();
      document.getElementById('imagePreview').classList.add('hidden');
      document.getElementById('advanced-fields')?.classList.add('hidden');
      resetForm();
      await loadProducts();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error al guardar el producto', 'error');
  }
});

// Editar producto
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const result = await response.json();

    if (result.success) {
      const p = result.data;
      
      document.getElementById("name").value = p.name;
      document.getElementById("price").value = p.price;
      document.getElementById("oldPrice").value = p.old_price;
      document.getElementById("level").value = p.level;
      document.getElementById("dimensions").value = p.dimensions;

      // Mostrar preview de la imagen actual
      if (p.img_url) {
        const imgUrl = `${API_URL.replace('/api', '')}${p.img_url}`;
        document.getElementById('previewImg').src = imgUrl;
        document.getElementById('imagePreview').classList.remove('hidden');
      }

      editingProductId = id;

      // Cambiar botón a modo edición
      const submitBtn = document.querySelector("#productForm button[type='submit']");
      submitBtn.textContent = "💾 Actualizar producto";
      submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
      submitBtn.classList.add("bg-green-600", "hover:bg-green-700");

      // Agregar botón de cancelar
      if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.type = 'button';
        cancelBtn.textContent = '❌ Cancelar';
        cancelBtn.className = 'px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition ml-2';
        cancelBtn.onclick = resetForm;
        submitBtn.parentNode.appendChild(cancelBtn);
      }

      // Scroll al formulario
      document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error cargando producto para editar', 'error');
  }
}

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", loadProducts);