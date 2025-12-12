const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function main() {
  try {
    console.log("=== Registrando usuario ===");
    let res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'eduss',
        email: 'eduss@example.com',
        password: '123456'
      })
    });
    console.log('Registro status:', res.status);
    console.log(await res.json());

  } catch (err) {
    console.log('Error registro:', err.message);
  }

  try {
    console.log("\n=== Haciendo login ===");
    let res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'eduss@example.com',
        password: '123456'
      })
    });
    const loginData = await res.json();
    console.log('Login status:', res.status);
    console.log(loginData);

    const token = loginData.token;

    if (!token) return console.log("No se obtuvo token, revisa login");

    console.log("\n=== Creando producto ===");
    res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Camiseta Azul',
        description: 'Talla M',
        price: 25,
        stock: 50
      })
    });
    const product = await res.json();
    console.log('Producto creado:', product);

    console.log("\n=== Añadiendo producto al carrito ===");
    res = await fetch(`${BASE_URL}/api/cart/add`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: 2
      })
    });
    const cart = await res.json();
    console.log('Carrito actualizado:', cart);

    console.log("\n=== Consultando carrito ===");
    res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const currentCart = await res.json();
    console.log('Contenido del carrito:', currentCart);

    console.log("\n=== Consultando productos públicos ===");
    res = await fetch(`${BASE_URL}/api/products`);
    const products = await res.json();
    console.log('Productos disponibles:', products);

  } catch (err) {
    console.log('Error prueba:', err.message);
  }
}

main();
