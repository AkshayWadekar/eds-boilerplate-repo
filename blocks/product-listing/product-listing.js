const API_BASE_URL = 'https://dummyjson.com/products';

function readConfig(block) {
  const config = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) {
      return;
    }

    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key) {
      config[key] = value;
    }
  });

  return config;
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-listing-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'product-listing-image';
  imageLink.href = `https://dummyjson.com/products/${product.id}`;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute(
    'aria-label',
    `View details for ${product.title}`,
  );

  const image = document.createElement('img');
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = 'lazy';
  image.width = 300;
  image.height = 220;

  imageLink.append(image);

  const content = document.createElement('div');
  content.className = 'product-listing-content';

  const category = document.createElement('p');
  category.className = 'product-listing-category';
  category.textContent = product.category;

  const title = document.createElement('h3');
  title.className = 'product-listing-title';
  title.textContent = product.title;

  const description = document.createElement('p');
  description.className = 'product-listing-description';
  description.textContent = product.description;

  const details = document.createElement('div');
  details.className = 'product-listing-details';

  const price = document.createElement('span');
  price.className = 'product-listing-price';
  price.textContent = `$${product.price.toFixed(2)}`;

  const rating = document.createElement('span');
  rating.className = 'product-listing-rating';
  rating.textContent = `Rating: ${product.rating}/5`;

  details.append(price, rating);

  const button = document.createElement('a');
  button.className = 'product-listing-button';
  button.href = `https://dummyjson.com/products/${product.id}`;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.textContent = 'View Product';

  content.append(
    category,
    title,
    description,
    details,
    button,
  );

  card.append(imageLink, content);

  return card;
}

function showMessage(block, message, type = 'info') {
  block.replaceChildren();

  const messageElement = document.createElement('p');
  messageElement.className = `product-listing-message ${type}`;
  messageElement.textContent = message;

  block.append(messageElement);
}

async function fetchProducts(category, limit) {
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const endpoint = category
    ? `${API_BASE_URL}/category/${encodeURIComponent(category)}`
    : API_BASE_URL;

  const url = new URL(endpoint);
  url.searchParams.set('limit', safeLimit.toString());
  url.searchParams.set(
    'select',
    'id,title,description,category,price,rating,thumbnail',
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Product API returned ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error('Unexpected response from Product API');
  }

  return data.products;
}

export default async function decorate(block) {
  const config = readConfig(block);

  const category = config.category || '';
  const parsedLimit = Number.parseInt(config.limit, 10);
  const limit = Number.isNaN(parsedLimit) ? 6 : parsedLimit;

  showMessage(block, 'Loading products…', 'loading');

  try {
    const products = await fetchProducts(category, limit);

    if (products.length === 0) {
      showMessage(block, 'No products were found.', 'empty');
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'product-listing-grid';

    products.forEach((product) => {
      grid.append(createProductCard(product));
    });

    block.replaceChildren(grid);
  } catch (error) {
    // Keep technical details in the browser console.
    console.error('Unable to load products:', error);

    showMessage(
      block,
      'Products are temporarily unavailable. Please try again later.',
      'error',
    );
  }
}