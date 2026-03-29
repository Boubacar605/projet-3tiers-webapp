const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3600;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pool de connexions MySQL avec variables d'environnement
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql-service',
    user: process.env.DB_USER || 'webuser',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'webapp',
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Vérification initiale de la connexion
async function checkDb() {
    try {
        await query('SELECT 1');
        console.log('Connecté à MySQL');
    } catch (err) {
        console.error('Erreur de connexion MySQL:', err);
    }
}
checkDb();

// --- CSS intégré ---
const css = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    color: #2c3e50;
    line-height: 1.6;
    padding: 2rem;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
    overflow: hidden;
    padding: 2rem;
  }
  h1, h2 {
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1e466e;
  }
  h1 {
    font-size: 2rem;
    border-left: 5px solid #3498db;
    padding-left: 1rem;
  }
  .btn {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 0.6rem 1.2rem;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .btn:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .btn-danger {
    background: #e74c3c;
  }
  .btn-danger:hover {
    background: #c0392b;
  }
  .btn-secondary {
    background: #95a5a6;
  }
  .btn-secondary:hover {
    background: #7f8c8d;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  .product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.1);
  }
  .product-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background: #f0f2f5;
  }
  .product-info {
    padding: 1rem;
  }
  .product-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .product-price {
    font-size: 1.1rem;
    color: #27ae60;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  .product-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .product-actions form {
    margin: 0;
  }
  .product-actions .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  .form-group {
    margin-bottom: 1.2rem;
  }
  label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
    color: #2c3e50;
  }
  input[type="text"], input[type="number"], input[type="url"] {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border 0.2s;
  }
  input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52,152,219,0.2);
  }
  .back-link {
    margin-top: 2rem;
    display: inline-block;
  }
  .message {
    background: #d4edda;
    color: #155724;
    padding: 0.8rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  .error {
    background: #f8d7da;
    color: #721c24;
  }
  hr {
    margin: 2rem 0;
    border: none;
    height: 1px;
    background: #e2e8f0;
  }
  @media (max-width: 768px) {
    body { padding: 1rem; }
    .container { padding: 1rem; }
  }
`;

function renderPage(content, title = 'Gestion de produits') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>${css}</style>
    </head>
    <body>
      <div class="container">
        ${content}
      </div>
    </body>
    </html>
  `;
}

// Routes
app.get('/', (req, res) => {
  const content = `
    <h1> Gestion de produits by Bouba</h1>
    <p>Bienvenue sur l'administration de votre boutique en ligne.</p>
    <div style="margin: 2rem 0;">
      <a href="/products" class="btn"> Voir les produits</a>
      <a href="/products/new" class="btn" style="margin-left: 1rem;"> Ajouter un produit</a>
    </div>
  `;
  res.send(renderPage(content, 'Accueil'));
});

app.get('/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products');
    let productsHtml = '<div class="product-grid">';
    for (const p of products) {
      productsHtml += `
        <div class="product-card">
          <img class="product-img" src="${p.image_url || 'https://via.placeholder.com/200x150?text=Produit'}" alt="${p.name}">
          <div class="product-info">
            <div class="product-name">${escapeHtml(p.name)}</div>
            <div class="product-price">${p.price} FCFA</div>
            <div class="product-actions">
              <a href="/products/${p.id}/edit" class="btn">Modifier</a>
              <form action="/products/${p.id}/delete" method="POST" style="display:inline">
                <button type="submit" class="btn btn-danger" onclick="return confirm('Supprimer ce produit ?')">Supprimer</button>
              </form>
            </div>
          </div>
        </div>
      `;
    }
    productsHtml += '</div>';
    const content = `
      <h2> Liste des produits</h2>
      ${productsHtml}
      <hr>
      <a href="/products/new" class="btn"> Ajouter un produit</a>
      <a href="/" class="btn btn-secondary" style="margin-left: 1rem;"> Retour accueil</a>
    `;
    res.send(renderPage(content, 'Liste des produits'));
  } catch (err) {
    console.error(err);
    res.status(500).send(renderPage('<div class="message error">Erreur base de données</div>', 'Erreur'));
  }
});

app.get('/products/new', (req, res) => {
  const content = `
    <h2> Ajouter un produit</h2>
    <form action="/products" method="POST">
      <div class="form-group">
        <label>Nom du produit *</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>Prix (FCFA) *</label>
        <input type="number" step="0.01" name="price" required>
      </div>
      <div class="form-group">
        <label>URL de l'image (optionnel)</label>
        <input type="url" name="image_url" placeholder="https://exemple.com/image.jpg">
      </div>
      <button type="submit" class="btn">Créer le produit</button>
      <a href="/products" class="btn btn-secondary" style="margin-left: 1rem;">Annuler</a>
    </form>
  `;
  res.send(renderPage(content, 'Ajouter un produit'));
});

app.post('/products', async (req, res) => {
  const { name, price, image_url } = req.body;
  try {
    await query('INSERT INTO products (name, price, image_url) VALUES (?, ?, ?)', [name, price, image_url || null]);
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).send(renderPage('<div class="message error">Erreur lors de l\'ajout</div>', 'Erreur'));
  }
});

app.get('/products/:id/edit', async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).send(renderPage('<div class="message error">Produit non trouvé</div>', 'Erreur'));
    const p = rows[0];
    const content = `
      <h2>Modifier ${escapeHtml(p.name)}</h2>
      <form action="/products/${id}?_method=PUT" method="POST">
        <input type="hidden" name="_method" value="PUT">
        <div class="form-group">
          <label>Nom</label>
          <input type="text" name="name" value="${escapeHtml(p.name)}" required>
        </div>
        <div class="form-group">
          <label>Prix (FCFA)</label>
          <input type="number" step="0.01" name="price" value="${p.price}" required>
        </div>
        <div class="form-group">
          <label>URL de l'image</label>
          <input type="url" name="image_url" value="${p.image_url || ''}" placeholder="https://exemple.com/image.jpg">
        </div>
        <button type="submit" class="btn">Mettre à jour</button>
        <a href="/products" class="btn btn-secondary" style="margin-left: 1rem;">Annuler</a>
      </form>
    `;
    res.send(renderPage(content, 'Modifier un produit'));
  } catch (err) {
    console.error(err);
    res.status(500).send(renderPage('<div class="message error">Erreur base de données</div>', 'Erreur'));
  }
});

app.post('/products/:id', async (req, res) => {
  if (req.body._method === 'PUT') {
    const id = req.params.id;
    const { name, price, image_url } = req.body;
    try {
      await query('UPDATE products SET name=?, price=?, image_url=? WHERE id=?', [name, price, image_url || null, id]);
      res.redirect('/products');
    } catch (err) {
      console.error(err);
      res.status(500).send(renderPage('<div class="message error">Erreur lors de la modification</div>', 'Erreur'));
    }
  } else {
    res.status(405).send('Method not allowed');
  }
});

app.post('/products/:id/delete', async (req, res) => {
  const id = req.params.id;
  try {
    await query('DELETE FROM products WHERE id = ?', [id]);
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.status(500).send(renderPage('<div class="message error">Erreur lors de la suppression</div>', 'Erreur'));
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});
