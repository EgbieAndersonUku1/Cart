import { checkIfHTMLElement } from "./utils.js";
import { createOrdersDiv } from "./components.js";
import { getLocalStorage } from "./db.js";

const form = document.getElementById("gateway-form");

const PRODUCT_STORAGE_KEY = "products";

// Note to self test to orders are shown - integrate to checkoutForm afterwards which will be called
showPurchasedOrders();

function showPurchasedOrders() {
    const purchasedOrders = getLocalStorage(PRODUCT_STORAGE_KEY);
    createOrdersDiv(purchasedOrders);
}


checkIfHTMLElement(form, "payment form");


function checkOutForm() {
    
}
