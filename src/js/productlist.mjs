export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      // Get the list of products from the dataSource
      this.products = await this.dataSource.getData(this.category);
      this.renderList();
    } catch (error) {
      console.error('Error initializing ProductList:', error);
    }
  }

  renderList() {
    // Clear existing content
    this.listElement.innerHTML = '';

    // Generate HTML for each product
    this.products.forEach(product => {
      const productCard = this.createProductCard(product);
      this.listElement.appendChild(productCard);
    });
  } // ✅ This closing brace was missing!

  createProductCard(product) {
    const template = document.getElementById('product-card-template');

    if (!template) {
      console.error('Product template not found!');
      return document.createElement('div');
    }

    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.product-card');
    const img = card.querySelector('img');
    const name = card.querySelector('.product-name');
    const description = card.querySelector('.product-description');
    const price = card.querySelector('.product-price');
    const button = card.querySelector('.add-to-cart');

    // Build the image path correctly with .jpg extension
    const imagePath = product.image ? `${product.image}.jpg` : '/images/placeholder.jpg';

    img.src = imagePath;
    img.alt = product.name;
    name.textContent = product.name;
    description.textContent = product.description || '';
    price.textContent = `$${product.price.toFixed(2)}`;
    button.dataset.id = product.id;

    return card;
  }

  async refresh() {
    await this.init();
  }

  filterProducts(filterFn) {
    const filteredProducts = this.products.filter(filterFn);
    this.renderFilteredList(filteredProducts);
  }

  renderFilteredList(products) {
    this.listElement.innerHTML = '';
    products.forEach(product => {
      const productCard = this.createProductCard(product);
      this.listElement.appendChild(productCard);
    });
  }
}
