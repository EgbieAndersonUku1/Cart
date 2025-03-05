import { getLocalStorage, updateProductInLocalStorage, removeFromLocalStorage  } from "./db.js";
import { closeMessageIcon, showPopupMessage } from "./messages.js";
import { modifyGridAndCenterContent, 
         updateCartQuantityTag, 
         updateCartQuantityDisplay, 
         updateSaveIconQuantity,
        } from "./cart-visuals..js";

import { handleSaveSidebar } from "./sidebar.js";
import { discountManager, extractDiscountCodeFromForm } from "./handle-discount-form.js";
import   getCartProductInfo from "./product.js";
import { cardsContainer, createProductCard } from "./components.js";
import { checkIfHTMLElement,
        applyDashToInput,
        concatenateWithDelimiter,
        extractCurrencyAndValue,
        showPopup, 
        toggleSpinner,
        setCartNavIconQuantity,
        showSpinnerFor,
        dimBackground,
        sanitizeText,
        } from "./utils.js";


const cartSummaryCard         = document.getElementById("cart-summary");
const orderTotal              = document.getElementById("order-total");
const priceTax                = document.getElementById("price-tax");
const priceTotal              = document.getElementById("price-total");
const shippingAndHandling     = document.getElementById("shipping-and-handling");
const spinner                 = document.getElementById("spinner");
const discountForm            = document.getElementById("apply-form");
const discountInputField      = document.getElementById("apply-input");
const minutesElement          = document.querySelector("#countdown .minutes");
const secondsEement           = document.querySelector("#countdown .seconds")
const productElements         = Array.from(document.querySelectorAll(".product"));
const checkoutTimer           = document.getElementById("checkout-timeout");
const checkoutBtnNow          = document.getElementById("checkout-now-btn")
const paymentSection          = document.getElementById("gateway-payment");
const paymentSectionCloseIcon = document.getElementById("close-geteway");
let   priceElementsArray      = Array.from(document.querySelectorAll(".product-price"));

const PRODUCT_STORAGE_KEY = "products";
const TIME_IN_MILLSECONDS = 1000;

const run = {
    init: () => {
        validatePageElements();
        reserveProductTimer();
        setReserveProductTimer({minutes:5, seconds:59}); // uses the default values e.g  minutes = 1 and seconds = 59
    }
}


run.init();


// EventListeners
document.addEventListener("DOMContentLoaded", () => {handleLocalStorageLoad(PRODUCT_STORAGE_KEY)});
window.addEventListener("beforeunload", () => handleSyncCartWithLocalStorage(".increase-quantity"));

window.addEventListener("click", handleEventDelegeation);
window.addEventListener("input", handleEventDelegeation); 


function handleSyncCartWithLocalStorage(actionType=".increase-quantity") {
    
    try {
        let updatedCount = 0;
        const productElements = document.querySelectorAll(actionType);

        if (productElements.length === 0) return;

        productElements.forEach((productElement) => {
            const productId   = productElement.dataset.productid;
            const productInfo = getCartProductInfo(productElement);

            if (!productInfo) {
                console.warn(`Product info not found for ID: ${productId}`);
                return;
            }

            updateProductInLocalStorage(PRODUCT_STORAGE_KEY, productInfo, productId);
            updatedCount++;
           
        } )
        return updatedCount;

    } catch (error) {
        console.error("Unexpected error in handleSyncCartWithLocalStorage:", error);  
        return -1; 

    }
       
}



function handleLocalStorageLoad(key) {

    const products = getLocalStorage(key);

    if (!products) return;

    if (!Array.isArray(products) || products.length == 0) {
        window.location.reload();
    }

    // The application is designed that when the cart.html page is refreshed, all deleted items are restored,  
    // now, any changes made to the quantity for each product will remain persistent even after a page refresh.
    //  
    // However, when a product is removed using the delete icon on the cart page and the page is refreshed,  
    // the localStorage becomes out of sync. This is because the refresh restores the items on the UI page,  
    // including their quantities or presistent quantites, but does not restore the deleted products in the localStorage.  
    //
    // As a result, the UI displays renewed data that is not reflected in localStorage.  
    // The `handleSyncCartWithLocalStorage` function ensures that localStorage is always in sync after a manual product deletion
    // and page refresh.  
    if (priceElementsArray.length != products.length) {
        handleSyncCartWithLocalStorage();
    }

    const EXPECTED_NO_OF_KEYS = 4;

    products.forEach((product) => {

        const productKeys = Object.keys(product);

        if ( productKeys < EXPECTED_NO_OF_KEYS) {
            console.warn(`There is ${ EXPECTED_NO_OF_KEYS - productKeys} keys missing from the product object.`);
        } else {
           
           // try to update the counter variable first - if the fails don't bother updating the product variabes
            const isSuccess = updateCartQuantityDisplay(product.selectorID, product.currentQty);
      
            if (isSuccess) {

                updateCartPrice(product.productIDName, product.currentQty, product.currentPrice);
                updateCartSummary();
                updateCartQuantityTag(priceElementsArray);
               
            } else {
                console.warn(`Missing selector or invalid selector for product: ${product.selectorID}`);
            }
        
        }
    })
   
}


/**
 * Handles and deals with event delegation
 * @param {*} e - The event
 */
function handleEventDelegeation(e) {
    console.log(e.target.id)
    handleQuantityChange(e)
    handleCloseIcon(e);
    handleDiscountInputField(e);
    handleCreditInputField(e);
    handleDiscountApplyBtn(e);
    handleRemoveFromCart(e);
    handleSave(e);
    handleSaveSidebar(e);
    handleCheckoutButton(e);
    handleCVCInputField(e);
  
   
}


function handleSave(e) {

    const EXPECTED_CLASS_NAMES = ["save-to-later", "save-img-icon", "p-save"];

    if (EXPECTED_CLASS_NAMES.some(className => e.target.classList.contains(className))) {
        const productInfo = getCartProductInfo(e);

        if (productInfo) {
            const cardDiv = createProductCard(productInfo);
            try {
                cardsContainer.add(cardDiv);
                updateSaveIconQuantity();
                handleRemoveFromCart(e, true);
                showPopupMessage("Your item has been saved. You can view it in the navigation bar by clicking the save icon")
            } catch (error) {
                console.warn(`Something went wrong and the card div with id ${cardDiv.id} and it couldn't be saved in the saved list`);
            }
        }
    }
}


/**
 * Updates the quantity of a product in the cart when either decrease or increase button is clicked.
 * @param {Event} e - The event object triggered by clicking the button.
 * @param {string} actionType - The type of action to perform e.g increase or decrease.
 */

function updateCartQuantity(e, actionType) {

    try {
        
        const {productIDName, currentProductQtyElement, currentQty, currentPrice } = getCartProductInfo(e);
        if (productIDName && currentProductQtyElement && currentQty && currentPrice) {
            
            const QUANTITY_SELECTOR_NAME = "increase-quantity";
            const newQuantity            = actionType == QUANTITY_SELECTOR_NAME ? currentQty + 1 : currentQty - 1;
    
            if (newQuantity < 1) {
                newQuantity = 1;
            }
         
            currentProductQtyElement.textContent = newQuantity;
            
            updateCartPrice(productIDName, newQuantity, currentPrice); 
        }; 
    } catch (error) {
        return;
    }
};


/**
 * Updates the cart summary card by updating the total price after the user hits plus or minus icons for each product.
 * The update includes adding the tax and the shipping cost to the overall product total.
 * @param {Event} e - The event object triggered by clicking the button.
 * @param {string} actionType - The type of action to perform e.g increase or decrease.
 */
function updateCartSummary() {
   
    if (!Array.isArray(priceElementsArray)) {
        console.error(`Expect an array list but got: ${typeof priceElementsArray}`);
        return;
    };

    let total = 0;
    let sign  = null;

    priceElementsArray.forEach((priceElement) => {

        const priceData = extractCurrencyAndValue(priceElement.textContent);
        if (!sign) {
            sign = priceData.currency;
        }
       
        total += priceData.amount;
    })

    const tax              = extractCurrencyAndValue(priceTax.textContent).amount;
    const shippingCost     = extractCurrencyAndValue(shippingAndHandling.textContent).amount; 
    priceTotal.textContent = concatenateWithDelimiter(sign, total);

    const totalOrderCost   = (total + tax + shippingCost);
    orderTotal.textContent = concatenateWithDelimiter(sign, totalOrderCost);

    if (discountManager.isDiscountApplied()) {
        const discountCode = discountManager.getCurrentAppliedDiscountCode();
        discountManager.applyDiscount(discountCode, true);
    };

    const elements = [priceTotal, orderTotal];

    elements.forEach((element) => {
        showPopup(element)
    })  
}


/**
 * Updates the cart price after the user clicks either minus or plus icon in the UI. The function then 
 * extract the product name and then uses the current price with the quantity to calculate the new price.
 * 
 * @param {*} productName - The name of the product
 * @param {*} quantity - The number of products
 * @param {*} currentPriceStr - The current price - this will be used in conjunction with the quantity to determine
 *                              the new price.
 * @returns 
 */
function updateCartPrice(productName, quantity, currentPriceStr) {
    if (!(typeof quantity == "number")) {
        console.error(`Expected the quantity to be a number but got ${quantity}`);
    }

    const priceID              = concatenateWithDelimiter(productName, "price", "-");
    const currentPriceElement  = document.getElementById(priceID);

    if (!checkIfHTMLElement(currentPriceElement, priceID)) return;

    if (!currentPriceStr || currentPriceStr.length < 2) {
        console.error(`Invalid price format: '${currentPriceStr}'`);
        return;
    };

    const priceData = extractCurrencyAndValue(currentPriceStr);
    const newPrice  = priceData.amount * quantity
    
    currentPriceElement.textContent = concatenateWithDelimiter(priceData.currency, newPrice.toString());
    updateCartQuantityTag(priceElementsArray);
    updateCartSummary();

}


/**
 * Removes a product from the cart and updates the cart summary.
 * 
 * This function removes the product from the DOM based on the `data-removedivid` attribute,
 * updates the cart summary.
 * 
 * Steps:
 * 1. Gets the `divID` of the product to remove from the `data-removedivid` attribute.
 * 2. Verifies if the product div and spinner elements exist.
 * 3. Shows a spinner while the removal process occurs.
 * 4. Removes the product div after a brief timeout (500ms).
 * 5. Updates the cart summary and quantity tag after removal.
 * 6. Hides the spinner once the process is complete.
 * 
 * @param {Event} e - The event object triggered by the remove action (e.g., clicking a remove button).
 */
function handleRemoveFromCart(e, silent=false) {

    const EXPECTED_CLASS_NAME = "remove";
    const divID               = e.target.dataset.removedivid || e.target.className == EXPECTED_CLASS_NAME;

    if (divID) {
        const productDiv          = document.getElementById(divID);
        const TIME_IN_MILLSECONDS = 500;
    
        if (!checkIfHTMLElement(productDiv, divID)) {
            console.error("Failed to remove the product div");
            return;
        };

        // make the item unclickable to prevent the user from clicking multiple times while it is spinner is spinning
        productDiv.style.pointerEvents = "none";
        const productIdentifier        =  productDiv?.id.split("-")[0] || '';

        toggleSpinner(spinner);

        setTimeout(() => {
            productDiv.remove();

            removeFromLocalStorage(PRODUCT_STORAGE_KEY, productIdentifier);
            updateProductArray();
            updateCartSummary();
            updateCartQuantityTag(priceElementsArray);
            toggleSpinner(spinner, false);
            removeCardSummary();
            removeTimerifNoProductsReserved();
         

        }, TIME_IN_MILLSECONDS);

        if (!silent) {
            const message = `Successfully removed product with ID: ${divID}`;
            showPopupMessage(message);
        }
       
    }
   
};


function removeTimerifNoProductsReserved() {
    if (priceElementsArray.length === 0) {
        checkoutTimer.remove();
    }
}


function setReserveProductTimer({minutes=1, seconds = 59}) {
    if (!Number.isInteger(minutes) || !Number.isInteger(seconds)) {
        console.error(`One or more values are not integers: Expected minutes and seconds to be integers, got minutes: ${typeof minutes}, seconds: ${typeof seconds}`);
        return;
    }

    formatTimeUnit(minutesElement, minutes);
    formatTimeUnit(secondsEement, seconds);

}



function reserveProductTimer() {

    let minutes = minutesElement.textContent;
    let seconds = secondsEement.textContent;

    
    if (seconds > 0) {
        seconds -= 1;
        secondsEement.textContent = seconds;
    }

    formatTimeUnit(secondsEement, seconds);

    if (seconds === 0) {

        minutes -= 1;
        secondsEement.textContent  = 59;
        formatTimeUnit(minutesElement, minutes);
    }
   
    if (minutes < 0) {
       const EMPTY = 0;

       resetTimer();
       clearInterval(reserveTimer);
       showSpinnerFor(spinner, TIME_IN_MILLSECONDS);
       showPopupMessage("Your items were removed from the cart and returned to services because the allocated purchase time expired.");
       removeAllProducts();
       removeCardSummary();
       setCartNavIconQuantity(EMPTY);
       updateCartQuantityTag(priceElementsArray);
       checkoutTimer.remove();
         
    };

    
};


function formatTimeUnit(timeElement, value) {
    const time = value < 10 ? "0" + value : String(value);
    timeElement.textContent = time;
};


const reserveTimer = setInterval(() => {
    reserveProductTimer();
}, TIME_IN_MILLSECONDS);



function resetTimer() {
    minutesElement.textContent = "00";
    secondsEement.textContent  = "00";
};



/**
 * The function removes card summary display card if the user has manually
 * removed all their item from the cart.
 * @returns 
 */
function removeCardSummary() {

    if (priceElementsArray.length === 0) {
        cartSummaryCard.remove();
        modifyGridAndCenterContent();
    }
}


function updateProductArray() {
    priceElementsArray = Array.from(document.querySelectorAll(".product-price"));
}


function removeAllProducts() {
    updateProductArray();

    if (!productElements) {
        console.error("Something went wrong and products element couldn't be found!");
        return;
    };

    if (!Array.isArray(productElements)) {
        console.log(`Expected an array for the products but got type ${typeof productElements}`);
        return;
    };

    productElements.forEach((product) => {
        product.remove();
    })

    updateProductArray();
};


function handleCheckoutButton(e) {
    const checkoutBtnNow = "checkout-now-btn";

    if (e.target.id === checkoutBtnNow ) {
        handleSyncCartWithLocalStorage();
        dimBackground(true);
        paymentSection.classList.add("show");
        checkoutTimer.classList.add("d-none");
    };
};


function handleQuantityChange(e) {
    const classList  = e.target.classList;
    const actionType = classList.contains("increase-quantity") ? "increase-quantity": classList.contains("decrease-quantity") ? "decrease-quantity": null;

    if (actionType) {
        updateCartSummary();
        updateCartQuantity(e, actionType);  
    };
};


function handleCloseIcon(e) {
    const messageCloseIconID             = "message-pop-close-icon";
    const paymentGatewaySectionCloseIcon =  "close-geteway";
    const imageGatewaySectionCloseIcon   = "payment-img-close-icon";

    if (e.target.id === messageCloseIconID) {
        closeMessageIcon();
    };

    if (e.target.id === paymentGatewaySectionCloseIcon || e.target.id === imageGatewaySectionCloseIcon) {
        dimBackground(false);
        paymentSection.classList.remove("show");
        checkoutTimer.classList.remove("d-none");
    };
};


function handleDiscountInputField(e) {
    const discountInputID  = "apply-input";
    if (e.target.id === discountInputID ) {
        applyDashToInput(e)
    };
}


function handleCreditInputField(e) {
    const creditInputFieldId = "credit-card-no";

    if (e.target.id === creditInputFieldId) {
        const lengthPerDash = 4;
        applyDashToInput(e, lengthPerDash, true);
    }
};


function handleDiscountApplyBtn(e) {

    const discountInputIDBtn = "apply-btn";
    if (e.target.id === discountInputIDBtn) {
       
        const code      = extractDiscountCodeFromForm(discountForm);
        const isSuccess = discountManager.applyDiscount(code);
 
        if (isSuccess) {
             discountInputField.value = "";
        }
     }
}



function handleCVCInputField(e) {
    
    const cvcInputFieldID = "cvc";

    if (e.target.id === cvcInputFieldID) {
        const numbersOnly = sanitizeText(e.target.value, true);
        e.target.value    = numbersOnly;
    }
}



function validatePageElements() {
    if (!checkIfHTMLElement(priceTotal, "Price Total")) return;
    if (!checkIfHTMLElement(discountForm, "discount Form")) return;
    if (!checkIfHTMLElement(priceTax,   "Price Total")) return;
    if (!checkIfHTMLElement(orderTotal, "Price Tax")) return;
    if (!checkIfHTMLElement(minutesElement, "minutes Elements")) return;
    if (!checkIfHTMLElement(secondsEement, "second Elements")) return;
    if (!checkIfHTMLElement(shippingAndHandling, "Shipping and Handling element")) return;
    if (!checkIfHTMLElement(checkoutTimer, "The checkout timeout element")) return;
    if (!checkIfHTMLElement(checkoutBtnNow, "The checkout Button element")) return;
    if (!checkIfHTMLElement(paymentSection, "The payment section element")) return;
    if (!checkIfHTMLElement(paymentSectionCloseIcon, "The payment section close Icon element")) return;
    if (!checkIfHTMLElement(cartSummaryCard, "Card Summary card")) return;

    
}


