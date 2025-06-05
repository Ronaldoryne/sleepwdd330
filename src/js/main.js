// Import the ProductList class as a module
import ProductList from './productlist.mjs';

// Mock data source to simulate API calls
class MockDataSource {
  constructor() {
    this.products = {
      outdoorgear: [
        {
          id: "cedar-ridge-rimrock",
          name: "Cedar Ridge Rimrock",
          description: "Durable outdoor gear for rugged adventures",
          price: 189.99,
          image: "/public/images/tents/cedar-ridge-rimrock"
        },
        {
          id: "marmot-ajax",
          name: "Marmot Ajax",
          description: "Premium Marmot outdoor equipment for all seasons",
          price: 249.99,
          image: "/public/images/tents/marmot-ajax"
        },
        {
          id: "northface-alpin",
          name: "North Face Alpin",
          description: "Alpine-grade gear from The North Face",
          price: 299.99,
          image: "/public/images/tents/northface-alpin"
        },
        {
          id: "northface-talus",
          name: "North Face Talus",
          description: "Technical outdoor gear for challenging terrain",
          price: 219.99,
          image: "/public/images/tents/the-northface-talus"
        }
      ]
    };
  }

  // Simulate async data fetching
  async getData(category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.products[category] || []);
      }, 1000); // Simulate network delay
    });
  }
}

// Initialize the application
async function initApp() {
  try {
    // Get the HTML element where products will be displayed
    const listElement = document.getElementById('product-list');
    
    // Create a data source instance
    const dataSource = new MockDataSource();
    
    // Create an instance of ProductList
    const productList = new ProductList('outdoorgear', dataSource, listElement);
    
    // Initialize and render the product list
    await productList.init();
    
    console.log('ProductList initialized successfully!');
    
    // Add event listener for "Add to Cart" buttons
    listElement.addEventListener('click', (event) => {
      if (event.target.classList.contains('add-to-cart')) {
        const productId = event.target.dataset.id;
        console.log(`Added product ${productId} to cart`);
        alert(`Product ${productId} added to cart!`);
      }
    });
    
  } catch (error) {
    console.error('Error initializing app:', error);
    document.getElementById('product-list').innerHTML = 
      '<div class="error">Error loading products. Please try again.</div>';
  }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);