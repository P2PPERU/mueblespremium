// Modal de producto estilo Alibaba/AliExpress
async function openProductModal(productId) {
    try {
        // Cargar información completa del producto
        const response = await fetch(`${API_URL}/products/${productId}`);
        const result = await response.json();
        
        if (!result.success) {
            alert('Error cargando producto');
            return;
        }
        
        const product = result.data;
        const discount = Math.round(((product.old_price - product.price) / product.old_price) * 100);
        
        // Preparar galería de imágenes
        let images = [];
        if (product.images && product.images.length > 0) {
            images = product.images.map(img => getImageUrl(img.image_url));
        } else if (product.img_url) {
            images = [getImageUrl(product.img_url)];
        } else {
            images = ['https://via.placeholder.com/600x400?text=Sin+Imagen'];
        }

        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-content').innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Galería de Imágenes -->
                <div class="space-y-4">
                    <div class="relative">
                        <img id="main-product-image" src="${images[0]}" alt="${product.name}" class="w-full h-96 object-cover rounded-lg border-2 border-gray-200" onerror="this.src='https://via.placeholder.com/600x400?text=Sin+Imagen'">
                        ${product.stock < 10 ? '<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">¡Últimas unidades!</div>' : ''}
                        ${product.is_featured ? '<div class="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><i data-feather="star" class="h-4 w-4 mr-1"></i>Destacado</div>' : ''}
                    </div>
                    
                    <!-- Miniaturas -->
                    ${images.length > 1 ? `
                        <div class="grid grid-cols-5 gap-2">
                            ${images.map((img, index) => `
                                <img src="${img}" 
                                     onclick="document.getElementById('main-product-image').src='${img}'" 
                                     class="w-full h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors"
                                     onerror="this.src='https://via.placeholder.com/100x100?text=${index+1}'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Información del Producto -->
                <div class="space-y-6">
                    <!-- Título y Rating -->
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="difficulty-badge px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                                Nivel ${product.level}
                            </span>
                            <span class="text-sm text-gray-500">${product.assembly_time || 'Tiempo variable'}</span>
                        </div>
                        
                        <div class="flex items-center gap-3 mb-3">
                            <div class="flex items-center">
                                ${generateStars(product.rating || 4.5)}
                                <span class="ml-2 text-lg font-semibold text-gray-900">${product.rating || '4.5'}</span>
                            </div>
                            <span class="text-gray-500">|</span>
                            <span class="text-gray-600">${product.reviews_count || 0} opiniones</span>
                            <span class="text-gray-500">|</span>
                            <span class="text-green-600 font-medium">${product.stock || 0} en stock</span>
                        </div>
                    </div>

                    <!-- Precio -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-baseline gap-3 mb-2">
                            <span class="text-4xl font-bold text-red-600">${formatCurrency(product.price)}</span>
                            <span class="text-xl text-gray-500 line-through">${formatCurrency(product.old_price)}</span>
                            <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">-${discount}%</span>
                        </div>
                        <p class="text-sm text-gray-600">Precio incluye IVA • Envío gratis en compras sobre S/ 200</p>
                    </div>

                    <!-- Descripción Corta -->
                    ${product.short_description ? `
                        <div class="border-l-4 border-indigo-500 pl-4">
                            <p class="text-gray-700 leading-relaxed">${product.short_description}</p>
                        </div>
                    ` : ''}

                    <!-- Información Rápida -->
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex items-center gap-2">
                            <i data-feather="package" class="h-5 w-5 text-indigo-600"></i>
                            <div>
                                <p class="text-gray-500">Material</p>
                                <p class="font-semibold">${product.material || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-feather="droplet" class="h-5 w-5 text-indigo-600"></i>
                            <div>
                                <p class="text-gray-500">Color</p>
                                <p class="font-semibold">${product.color || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-feather="maximize" class="h-5 w-5 text-indigo-600"></i>
                            <div>
                                <p class="text-gray-500">Dimensiones</p>
                                <p class="font-semibold">${product.dimensions}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-feather="shield" class="h-5 w-5 text-indigo-600"></i>
                            <div>
                                <p class="text-gray-500">Garantía</p>
                                <p class="font-semibold">${product.warranty || '2 años'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="space-y-3 pt-4 border-t">
                        <div class="flex gap-3">
                            <div class="flex items-center border border-gray-300 rounded-lg">
                                <button onclick="updateModalQuantity(-1)" class="px-4 py-2 hover:bg-gray-100">
                                    <i data-feather="minus" class="h-4 w-4"></i>
                                </button>
                                <input type="number" id="modal-quantity" value="1" min="1" max="${product.stock}" class="w-16 text-center border-x border-gray-300 py-2">
                                <button onclick="updateModalQuantity(1)" class="px-4 py-2 hover:bg-gray-100">
                                    <i data-feather="plus" class="h-4 w-4"></i>
                                </button>
                            </div>
                            <button onclick="addToCartFromModal(${product.id})" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2">
                                <i data-feather="shopping-cart" class="h-5 w-5"></i>
                                Agregar al Carrito
                            </button>
                        </div>
                        <button onclick="buyNow(${product.id})" class="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                            Comprar Ahora
                        </button>
                        <div class="grid grid-cols-2 gap-2">
                            <button class="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <i data-feather="heart" class="h-4 w-4"></i>
                                <span class="text-sm">Guardar</span>
                            </button>
                            <button class="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <i data-feather="share-2" class="h-4 w-4"></i>
                                <span class="text-sm">Compartir</span>
                            </button>
                        </div>
                    </div>

                    <!-- Garantías -->
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <div class="flex items-center gap-2 text-green-800">
                            <i data-feather="check-circle" class="h-5 w-5"></i>
                            <span class="font-semibold">Compra Segura</span>
                        </div>
                        <div class="text-sm text-green-700 space-y-1">
                            <p>✓ Envío gratis en compras sobre S/ 200</p>
                            <p>✓ Devolución gratis en 30 días</p>
                            <p>✓ Garantía de ${product.warranty || '2 años'}</p>
                            <p>✓ Soporte técnico 24/7</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs de Información Detallada -->
            <div class="mt-8 border-t pt-8">
                <div class="flex border-b border-gray-200 mb-6">
                    <button onclick="showTab('description')" class="tab-btn active px-6 py-3 font-semibold border-b-2 border-indigo-600 text-indigo-600">
                        Descripción
                    </button>
                    <button onclick="showTab('specifications')" class="tab-btn px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-indigo-600">
                        Especificaciones
                    </button>
                    <button onclick="showTab('features')" class="tab-btn px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-indigo-600">
                        Características
                    </button>
                    <button onclick="showTab('reviews')" class="tab-btn px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 hover:text-indigo-600">
                        Opiniones (${product.reviews_count || 0})
                    </button>
                </div>

                <!-- Descripción -->
                <div id="tab-description" class="tab-content">
                    <div class="prose max-w-none">
                        <div class="whitespace-pre-line text-gray-700 leading-relaxed">
                            ${product.description || 'No hay descripción disponible.'}
                        </div>
                    </div>
                </div>

                <!-- Especificaciones -->
                <div id="tab-specifications" class="tab-content hidden">
                    ${Object.keys(product.specifications || {}).length > 0 ? Object.entries(product.specifications).map(([category, specs]) => `
                        <div class="mb-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-3 pb-2 border-b">${category}</h3>
                            <table class="w-full">
                                <tbody>
                                    ${specs.map(spec => `
                                        <tr class="border-b">
                                            <td class="py-3 pr-4 text-gray-700 font-medium w-1/3">${spec.name}</td>
                                            <td class="py-3 text-gray-900">${spec.value}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `).join('') : '<p class="text-gray-500">No hay especificaciones disponibles.</p>'}
                </div>

                <!-- Características -->
                <div id="tab-features" class="tab-content hidden">
                    ${product.features && product.features.length > 0 ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${product.features.map(feature => `
                                <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <i data-feather="check-circle" class="h-6 w-6 text-green-500 flex-shrink-0 mt-1"></i>
                                    <div>
                                        <h4 class="font-semibold text-gray-900 mb-1">${feature.feature_name}</h4>
                                        <p class="text-sm text-gray-600">${feature.feature_value}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">No hay características disponibles.</p>'}
                </div>

                <!-- Opiniones -->
                <div id="tab-reviews" class="tab-content hidden">
                    <div class="text-center py-8 text-gray-500">
                        <i data-feather="message-circle" class="h-12 w-12 mx-auto mb-4 text-gray-300"></i>
                        <p>Sé el primero en dejar tu opinión sobre este producto</p>
                        <button class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Escribir Opinión
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('product-modal').classList.add('active');
        feather.replace();
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        alert('Error cargando información del producto');
    }
}

// Generar estrellas de rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i data-feather="star" class="h-5 w-5 text-yellow-400 fill-current inline"></i>';
    }
    if (hasHalfStar) {
        stars += '<i data-feather="star" class="h-5 w-5 text-yellow-400 inline" style="fill: url(#half);"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i data-feather="star" class="h-5 w-5 text-gray-300 inline"></i>';
    }
    return stars;
}

// Mostrar tabs en el modal
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('border-transparent', 'text-gray-600');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Activar botón correspondiente
    event.target.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    event.target.classList.remove('border-transparent', 'text-gray-600');
}

// Actualizar cantidad en el modal
function updateModalQuantity(change) {
    const input = document.getElementById('modal-quantity');
    const currentValue = parseInt(input.value);
    const newValue = currentValue + change;
    const max = parseInt(input.max);
    
    if (newValue >= 1 && newValue <= max) {
        input.value = newValue;
    }
}

// Agregar al carrito desde el modal
function addToCartFromModal(productId) {
    const quantity = parseInt(document.getElementById('modal-quantity').value);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    updateCartUI();
    showCartNotification();
    closeProductModal();
}

// Comprar ahora
function buyNow(productId) {
    addToCartFromModal(productId);
    closeProductModal();
    checkout();
}

// Modal de producto (versión anterior mantenida para compatibilidad)// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Estado global de la aplicación
let products = [];
let cart = [];
let currentPage = 'home';

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    feather.replace();
    loadProductsFromBackend();
    loadGallery();
    loadTutorials();
    updateCartUI();
});

// Cargar productos desde el backend o archivo local
async function loadProductsFromBackend() {
    try {
        // Primero intentar cargar desde archivo JSON local
        console.log('Cargando productos desde archivo local...');
        const localResponse = await fetch('data/products.json');

        if (localResponse.ok) {
            products = await localResponse.json();
            console.log('Productos cargados desde archivo local:', products.length);
            loadProducts();
            loadFeaturedProducts();
            return;
        }
    } catch (localError) {
        console.log('No se pudo cargar desde archivo local, intentando backend...');
    }

    // Si falla el archivo local, intentar desde backend
    try {
        console.log('Cargando productos desde:', `${API_URL}/products`);
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();

        if (result.success && result.data) {
            products = result.data;
            console.log('Productos cargados desde backend:', products.length);
            loadProducts();
            loadFeaturedProducts();
        } else {
            console.error('Error en respuesta:', result);
            showEmptyState();
        }
    } catch (error) {
        console.error('Error cargando productos desde backend:', error);
        showEmptyState();
    }
}

// Mostrar estado vacío
function showEmptyState() {
    const containers = ['products-container', 'featured-products'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-gray-500 text-xl mt-4 font-medium">No hay productos disponibles</p>
                    <p class="text-gray-400 text-sm mt-2">Agrega productos desde el <a href="admin/dashboard.html" class="text-indigo-600 hover:underline">panel administrativo</a></p>
                </div>
            `;
        }
    });
}

// Formateador de moneda
function formatCurrency(value) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2
    }).format(value);
}

// Obtener URL de imagen
function getImageUrl(imgUrl) {
    if (!imgUrl) return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    if (imgUrl.startsWith('http')) return imgUrl;
    return `${API_URL.replace('/api', '')}${imgUrl}`;
}

// Navegación entre páginas
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId + '-page').classList.add('active');
    currentPage = pageId;
    
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('border-indigo-500', 'text-gray-900');
        link.classList.add('border-transparent', 'text-gray-500');
    });
    
    window.scrollTo(0, 0);
    feather.replace();
}

// Cargar productos
function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        showEmptyState();
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    feather.replace();
}

function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        showEmptyState();
        return;
    }
    
    // Mostrar solo los primeros 3 productos como destacados
    products.slice(0, 3).forEach(product => {
        const productCard = createFeaturedProductCard(product);
        container.appendChild(productCard);
    });
    
    feather.replace();
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden product-card cursor-pointer hover:shadow-2xl transition-shadow';

    const levelColors = {
        'A': 'bg-indigo-100 text-indigo-800',
        'B': 'bg-yellow-100 text-yellow-800',
        'C': 'bg-red-100 text-red-800'
    };

    // Soporte para formato de backend (old_price) y formato local (oldPrice)
    const oldPrice = product.old_price || product.oldPrice || product.price * 1.2;
    const imgUrl = product.img_url || product.img || '';
    const discount = Math.round(((oldPrice - product.price) / oldPrice) * 100);

    card.innerHTML = `
        <div class="aspect-w-16 aspect-h-12 bg-gray-200 relative overflow-hidden">
            <img src="${getImageUrl(imgUrl)}" alt="${product.name}" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">
            ${discount > 0 ? `<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">-${discount}%</div>` : ''}
        </div>
        <div class="p-6">
            <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.name}</h3>
                <span class="difficulty-badge px-2 py-1 rounded-full ${levelColors[product.level]} font-semibold text-xs ml-2 flex-shrink-0">
                    ${product.level}
                </span>
            </div>
            ${product.category ? `<p class="text-xs text-indigo-600 font-medium mb-1">${product.category}</p>` : ''}
            <p class="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <i data-feather="maximize" class="h-3 w-3"></i>
                ${product.dimensions}
            </p>
            ${product.material ? `<p class="text-xs text-gray-600 mb-3 flex items-center gap-1">
                <i data-feather="box" class="h-3 w-3"></i>
                ${product.material}
            </p>` : ''}
            <div class="flex items-end justify-between mb-4">
                <div>
                    <span class="text-2xl font-bold text-gray-900">${formatCurrency(product.price / 100)}</span>
                    ${discount > 0 ? `<span class="text-sm text-gray-500 line-through ml-2">${formatCurrency(oldPrice / 100)}</span>` : ''}
                </div>
            </div>
            <button onclick="addToCart(${product.id})" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <i data-feather="shopping-cart" class="h-4 w-4"></i>
                Agregar al Carrito
            </button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            openProductModal(product.id);
        }
    });

    return card;
}

function createFeaturedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden product-card cursor-pointer group hover:shadow-2xl transition-all';

    // Soporte para formato de backend (old_price) y formato local (oldPrice)
    const oldPrice = product.old_price || product.oldPrice || product.price * 1.2;
    const imgUrl = product.img_url || product.img || '';
    const discount = Math.round(((oldPrice - product.price) / oldPrice) * 100);

    card.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="${getImageUrl(imgUrl)}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">
            <div class="absolute top-4 right-4">
                <span class="difficulty-badge px-3 py-1 rounded-full bg-white text-indigo-800 font-semibold text-xs shadow-lg">
                    Nivel ${product.level}
                </span>
            </div>
            ${discount > 0 ? `<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">-${discount}%</div>` : ''}
        </div>
        <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${product.name}</h3>
            ${product.category ? `<p class="text-sm text-indigo-600 font-medium mb-2">${product.category}</p>` : ''}
            ${product.description ? `<p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description}</p>` : ''}
            <p class="text-sm text-gray-600 mb-4 flex items-center gap-1">
                <i data-feather="maximize" class="h-3 w-3"></i>
                ${product.dimensions}
            </p>
            <div class="flex items-center justify-between mb-4">
                <div class="flex flex-col">
                    <span class="text-2xl font-bold text-gray-900">${formatCurrency(product.price / 100)}</span>
                    ${discount > 0 ? `<span class="text-sm text-gray-500 line-through">${formatCurrency(oldPrice / 100)}</span>` : ''}
                </div>
            </div>
            <button onclick="openProductModal(${product.id})" class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2">
                <i data-feather="eye" class="h-4 w-4"></i>
                Ver Producto
            </button>
        </div>
    `;

    return card;
}

// Modal de producto
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const discount = Math.round(((product.old_price - product.price) / product.old_price) * 100);

    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-content').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <img src="${getImageUrl(product.img_url)}" alt="${product.name}" class="w-full h-80 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/600x400?text=Sin+Imagen'">
            </div>
            <div>
                <div class="mb-4">
                    <span class="difficulty-badge px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                        Nivel ${product.level}
                    </span>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-900 mb-2">Dimensiones:</h4>
                    <p class="text-gray-600">${product.dimensions}</p>
                </div>
                
                <div class="border-t border-gray-200 pt-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <span class="text-3xl font-bold text-gray-900">${formatCurrency(product.price)}</span>
                            <span class="text-lg text-gray-500 line-through ml-2">${formatCurrency(product.old_price)}</span>
                        </div>
                        <span class="text-lg text-green-600 font-semibold">${discount}% OFF</span>
                    </div>
                    
                    <div class="space-y-3">
                        <button onclick="addToCart(${product.id}); closeProductModal();" class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            Agregar al Carrito
                        </button>
                        <button onclick="checkout(); closeProductModal();" class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            Comprar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('product-modal').classList.add('active');
    feather.replace();
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

// Funciones del carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();
    showCartNotification();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Actualizar contador
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }

    // Actualizar items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i data-feather="shopping-cart" class="h-12 w-12 mx-auto mb-4 text-gray-300"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg mb-4">
                <img src="${getImageUrl(item.img_url)}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/100x100?text=Sin+Imagen'">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${item.name}</h4>
                    <p class="text-sm text-gray-500">${formatCurrency(item.price)}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateCartQuantity(${item.id}, -1)" class="p-1 text-gray-400 hover:text-gray-600">
                        <i data-feather="minus" class="h-4 w-4"></i>
                    </button>
                    <span class="font-medium">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)" class="p-1 text-gray-400 hover:text-gray-600">
                        <i data-feather="plus" class="h-4 w-4"></i>
                    </button>
                </div>
                <button onclick="removeFromCart(${item.id})" class="p-1 text-red-400 hover:text-red-600">
                    <i data-feather="trash-2" class="h-4 w-4"></i>
                </button>
            </div>
        `).join('');
    }

    // Actualizar total
    cartTotal.textContent = formatCurrency(total);
    
    feather.replace();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('translate-x-full');
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="check" class="h-5 w-5 mr-2"></i>
            <span>Producto agregado al carrito</span>
        </div>
    `;
    document.body.appendChild(notification);
    feather.replace();

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Aquí puedes implementar la lógica de checkout
    alert(`Total a pagar: ${formatCurrency(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}\n\nFuncionalidad de checkout en desarrollo.`);
}

// Búsqueda
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    
    if (overlay.style.display === 'none' || overlay.style.display === '') {
        overlay.style.display = 'flex';
        input.focus();
    } else {
        overlay.style.display = 'none';
        input.value = '';
        document.getElementById('search-results').innerHTML = '';
    }
}

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const results = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.dimensions.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No se encontraron productos</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(product => `
        <div onclick="openProductModal(${product.id}); toggleSearch();" class="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <img src="${getImageUrl(product.img_url)}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/100x100?text=Sin+Imagen'">
            <div class="flex-1">
                <h4 class="font-medium text-gray-900">${product.name}</h4>
                <p class="text-sm text-gray-500">${formatCurrency(product.price)}</p>
            </div>
        </div>
    `).join('');
}

// Filtros
function filterProducts() {
    const levelFilter = document.getElementById('level-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    let filteredProducts = [...products];

    // Filtrar por nivel
    if (levelFilter) {
        filteredProducts = filteredProducts.filter(product => product.level === levelFilter);
    }

    // Ordenar
    if (sortFilter) {
        switch (sortFilter) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }

    // Actualizar display
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-xl">No se encontraron productos con esos filtros</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    feather.replace();
}

// Cargar galería
async function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    try {
        const response = await fetch('data/gallery.json');
        const galleryProjects = await response.json();

        container.innerHTML = galleryProjects.map(project => `
            <div class="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300">
                <img src="${project.image}" alt="${project.title}" class="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/800x600?text=Proyecto'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div class="mb-2">
                            <span class="inline-block bg-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">${project.category}</span>
                        </div>
                        <h3 class="font-bold text-xl mb-2">${project.title}</h3>
                        <p class="text-sm opacity-90 mb-2">${project.description}</p>
                        <div class="flex items-center justify-between text-xs opacity-75">
                            <div class="flex items-center gap-2">
                                <i data-feather="user" class="h-4 w-4"></i>
                                <span>${project.client}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i data-feather="map-pin" class="h-4 w-4"></i>
                                <span>${project.location}</span>
                            </div>
                        </div>
                        ${project.products && project.products.length > 0 ? `
                            <div class="mt-3 pt-3 border-t border-white/20">
                                <p class="text-xs font-semibold mb-1">Productos usados:</p>
                                <div class="flex flex-wrap gap-1">
                                    ${project.products.slice(0, 3).map(prod => `
                                        <span class="bg-white/20 px-2 py-1 rounded text-xs">${prod}</span>
                                    `).join('')}
                                    ${project.products.length > 3 ? `<span class="text-xs opacity-75">+${project.products.length - 3} más</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        feather.replace();
    } catch (error) {
        console.error('Error cargando galería:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i data-feather="alert-circle" class="h-12 w-12 mx-auto mb-4 text-gray-400"></i>
                <p class="text-gray-500">Error al cargar la galería de proyectos</p>
            </div>
        `;
        feather.replace();
    }
}

// Cargar tutoriales
function loadTutorials() {
    const container = document.getElementById('tutorials-container');
    if (!container) return;
    
    const tutorials = [
        {
            title: "Armado Básico - Nivel A",
            duration: "15 min",
            difficulty: "Fácil",
            thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Aprende los fundamentos del armado de muebles con este tutorial completo."
        },
        {
            title: "Técnicas Avanzadas - Nivel B",
            duration: "25 min",
            difficulty: "Intermedio",
            thumbnail: "https://images.unsplash.com/photo-1581092918484-8313dbef5666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Domina técnicas más complejas para muebles de nivel intermedio."
        },
        {
            title: "Proyectos Expertos - Nivel C",
            duration: "45 min",
            difficulty: "Avanzado",
            thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Construcción de muebles complejos con mecanismos especiales."
        },
        {
            title: "Herramientas Esenciales",
            duration: "12 min",
            difficulty: "Básico",
            thumbnail: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Conoce todas las herramientas que necesitas para cada proyecto."
        },
        {
            title: "Acabados y Detalles",
            duration: "20 min",
            difficulty: "Intermedio",
            thumbnail: "https://images.unsplash.com/photo-1581092918484-8313dbef5666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Técnicas profesionales para darle el toque final a tus muebles."
        },
        {
            title: "Solución de Problemas",
            duration: "18 min",
            difficulty: "Básico",
            thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            description: "Aprende a resolver los problemas más comunes durante el armado."
        }
    ];

    container.innerHTML = tutorials.map(tutorial => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer">
            <div class="relative">
                <img src="${tutorial.thumbnail}" alt="${tutorial.title}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="bg-white bg-opacity-90 rounded-full p-4">
                        <i data-feather="play" class="h-8 w-8 text-indigo-600"></i>
                    </div>
                </div>
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    ${tutorial.duration}
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">${tutorial.title}</h3>
                    <span class="difficulty-badge px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-xs">
                        ${tutorial.difficulty}
                    </span>
                </div>
                <p class="text-gray-600 text-sm">${tutorial.description}</p>
                <button class="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Ver Tutorial
                </button>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(e) {
    if (e.target.id === 'search-overlay') {
        toggleSearch();
    }
    if (e.target.id === 'product-modal') {
        closeProductModal();
    }
});

// Cerrar carrito al hacer clic fuera
document.addEventListener('click', function(e) {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartButton = e.target.closest('[onclick="toggleCart()"]');
    
    if (!cartSidebar.contains(e.target) && !cartButton && !cartSidebar.classList.contains('translate-x-full')) {
        cartSidebar.classList.add('translate-x-full');
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay.style.display === 'flex') {
            toggleSearch();
        }
    }
});