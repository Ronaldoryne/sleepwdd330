import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
  
  // After rendering cart items, check if cart has items and show total
  displayCartTotal(cartItems);
}

function cartItemTemplate(item) {
  const newItem = `<li class='cart-card divider'>
  <a href='#' class='cart-card__image'>
    <img
      src='${item.Image}'
      alt='${item.Name}'
    />
  </a>
  <a href='#'>
    <h2 class='card__name'>${item.Name}</h2>
  </a>
  <p class='cart-card__color'>${item.Colors[0].ColorName}</p>
  <p class='cart-card__quantity'>qty: 1</p>
  <p class='cart-card__price'>$${item.FinalPrice}</p>
</li>`;
 
  return newItem;
}

function displayCartTotal(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalElement = document.querySelector(".cart-total");
  
  // Check if cart has items
  if (cartItems && cartItems.length > 0) {
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.FinalPrice);
    }, 0);
    
    // Show the cart footer by removing hide class
    cartFooter.classList.remove("hide");
    
    // Update the total display
    cartTotalElement.innerHTML = `Total: $${total.toFixed(2)}`;
  } else {
    // Hide the cart footer if no items
    cartFooter.classList.add("hide");
  }
}

renderCartContents();