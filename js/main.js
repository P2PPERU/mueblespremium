function loadProducts() {
  const saved = localStorage.getItem("products");
  const products = saved ? JSON.parse(saved) : [];

  const container = document.getElementById("catalogo-container");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p class='col-span-3 text-center text-gray-500'>No hay productos cargados</p>";
    return;
  }

  // Formateador de moneda en soles (S/.)
  const formatCurrency = (value) => {
    return value.toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    });
  };

  products.forEach((p) => {
    container.innerHTML += `
      <div class="group relative product-card shadow p-4 rounded-lg">
        <div class="w-full h-56 bg-gray-200 rounded-md overflow-hidden">
          <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover">
        </div>
        <div class="mt-4 flex justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${p.name}</h3>
            <span class="difficulty-badge px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold uppercase">Nivel ${p.level}</span>
            <span class="ml-2 text-sm text-gray-500">${p.dimensions}</span>
          </div>
          <div class="text-right">
            <p class="text-lg font-medium text-gray-900">${formatCurrency(p.price)}</p>
            <p class="text-sm text-gray-500 line-through">${formatCurrency(p.oldPrice)}</p>
          </div>
        </div>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadProducts);
