let products = JSON.parse(localStorage.getItem("products")) || [];

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  products.forEach((p, i) => {
    list.innerHTML += `
      <li class="p-4 bg-white shadow flex justify-between">
        <span>${p.name} - $${p.price}</span>
        <button onclick="deleteProduct(${i})" class="text-red-600">Eliminar</button>
      </li>
    `;
  });

  localStorage.setItem("products", JSON.stringify(products));
}

document.getElementById("productForm").addEventListener("submit", e => {
  e.preventDefault();

  const newProduct = {
    id: Date.now(),
    name: document.getElementById("name").value,
    price: parseFloat(document.getElementById("price").value),
    oldPrice: parseFloat(document.getElementById("oldPrice").value),
    level: document.getElementById("level").value,
    dimensions: document.getElementById("dimensions").value,
    img: document.getElementById("img").value,
  };

  products.push(newProduct);
  renderProducts();
  e.target.reset();
});

function deleteProduct(i) {
  products.splice(i, 1);
  renderProducts();
}

document.addEventListener("DOMContentLoaded", renderProducts);
