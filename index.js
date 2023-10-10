const express = require("express");
const app = express();
const products = require("./data/products.json");

let credit = 25000000;
let cart = {};

app.use(express.json());

// get all
app.get("/api/products", (req, res) => {
  return res.json({ data: products });
});

// add cart
app.post("/api/cart", (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({
      message: "Produk tidak ada.",
    });
  }

  if (quantity > product.stock) {
    return res.status(200).json({
      message: "Stock tidak mencukupi",
    });
  }

  //   cek apakah produk ada di cart
  if (cart[productId]) {
    // pastikan jumlah barang sesuai stock
    if (cart[productId].quantity + quantity > product.stock) {
      return res.status(400).json({
        message: "Stock tidak mencukupi.",
      });
    }

    // tambahkan quantity ke cart
    cart[productId].quantity += quantity;

    // tambahkan total
    cart[productId].total += quantity * product.price;
  } else {
    // jika belum ada, tambahkan product ke cart
    cart[productId] = {
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity,
    };
  }

  return res.json({
    message: "Produk berhasil ditambahkan ke cart!",
    data: Object.values(cart),
  });
});

// get view cart
app.get("/api/cart", (req, res) => {
  return res.json({ data: Object.values(cart) });
});

// delete cart
app.delete("/api/cart", (req, res) => {
  cart = {};
  return res.json({ message: "Cart Berhasil Dihapus!" });
});

// get saldo
app.get("/api/credit", (req, res) => {
  console.log(credit);
  return res.json({ data: credit });
});

// checkout
app.post("/api/checkout", (req, res) => {
  // ambil data dari body request
  const { name, address, phone } = req.body;

  // cek apakah cart kosong
  if (Object.keys(cart).length === 0) {
    return res.status(400).json({
      message: "Cart Masih Kosong.",
    });
  }

  // hitung total harga
  let total = 0;
  for (const item of Object.values(cart)) {
    total += item.total;
  }

  // cek apakah saldo cukup
  if (total > credit) {
    return res.status(400).json({
      message: "Saldo Tidak Cukup",
    });
  }

  //   kurangi saldo
  credit -= total;

  //   kirim pesan
  return res.json({
    message: "Pesanan Berhasil Diproses",
    data: {
      name,
      address,
      phone,
      total,
      credit,
    },
  });
});

app.listen(3000, () => {
  console.log("Server 3000 yh");
});
