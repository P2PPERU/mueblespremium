// Cargar productos y renderizar catálogo
async function loadProducts() {
  let products = [];

  // Intentar cargar desde admin
  if (window.adminProducts && window.adminProducts.length > 0) {
    products = window.adminProducts;
  } else {
    // Si no hay productos del admin, cargar desde JSON
    try {
      const response = await fetch('data/products.json');
      products = await response.json();
    } catch (error) {
      console.log('No se pudieron cargar productos');
      products = [];
    }
  }

  renderCatalog(products);
}

// Renderizar catálogo en la página principal
function renderCatalog(products) {
  const container = document.getElementById("catalogo-container");
  
  if (!container) return;

  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 text-center py-12">
        <p class="text-gray-500 text-lg">No hay productos disponibles</p>
        <p class="text-gray-400 text-sm mt-2">Los productos se cargarán desde el panel administrativo</p>
      </div>
    `;
    return;
  }

  // Formateador de moneda en soles
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(value);
  };

  // Mapeo de colores por nivel
  const levelColors = {
    A: { bg: "bg-indigo-100", text: "text-indigo-800" },
    B: { bg: "bg-yellow-100", text: "text-yellow-800" },
    C: { bg: "bg-red-100", text: "text-red-800" }
  };

  products.forEach((p, index) => {
    const colors = levelColors[p.level] || levelColors.A;
    const delay = (index % 3) * 100 + 100;

    container.innerHTML += `
      <div class="group relative product-card" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
          <img src="${p.img}" alt="${p.name}" class="w-full h-full object-center object-cover lg:w-full lg:h-full">
        </div>
        <div class="mt-4 flex justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              <a href="#">
                <span aria-hidden="true" class="absolute inset-0"></span>
                ${p.name}
              </a>
            </h3>
            <div class="mt-1 flex items-center">
              <span class="difficulty-badge px-2 py-1 rounded-full ${colors.bg} ${colors.text} font-semibold uppercase">Nivel ${p.level}</span>
              <span class="ml-2 text-sm text-gray-500">${p.dimensions}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-medium text-gray-900">${formatCurrency(p.price)}</p>
            <p class="text-sm text-gray-500 line-through">${formatCurrency(p.oldPrice)}</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2">
          <a href="#" class="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Armado
          </a>
          <a href="#" class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Semiarmado
          </a>
          <a href="#" class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guía
          </a>
        </div>
      </div>
    `;
  });
}

// Cargar productos cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", loadProducts);

// Recargar productos cada 2 segundos si hay cambios en el admin
setInterval(() => {
  if (window.adminProducts) {
    loadProducts();
  }
}, 2000);