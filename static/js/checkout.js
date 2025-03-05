import { checkIfHTMLElement, maskCreditCardNo, toggleSpinner } from "./utils.js";
import { createOrdersDiv } from "./components.js";
import { getLocalStorage } from "./db.js";

const form                     = document.getElementById("gateway-form");
const error                    = document.getElementById("gateway-error");
const creditNoField            = document.getElementById("credit-card-no");
const spinner2                 = document.querySelector(".spinner2");
const paymentSection           = document.getElementById("gateway-payment");
const orderConfirmationSection = document.getElementById("order-confirmation");
const cardDetailsElement       = document.getElementById("payment-card-details");
const billingAddressElement    = document.getElementById("billing-address");
const deliveryDateElement      = document.getElementById("delivery-date");
const fullNameElement          = document.getElementById("fullname");
const totalOrderCostElement    = document.getElementById("total-order-cost");
const PRODUCT_STORAGE_KEY      = "products";


validatePageElements();

form.addEventListener("submit", handleCheckoutForm);

creditNoField.addEventListener("input", handleCreditNumberField)


function handleCreditNumberField(e)  {

    const EXPECTED_CREDIT_NUMBER = 19;
    const currentCharLength      = e.target.value.length;

    if (currentCharLength < EXPECTED_CREDIT_NUMBER ) {
        const msg = `The credit card number must be 16 digits. Remaining characters:  ${ EXPECTED_CREDIT_NUMBER - currentCharLength } chars`;
        creditNoField.setCustomValidity(msg);
    } else {
        creditNoField.setCustomValidity("");
    }
}


export function handleCheckoutForm(e) {
   
    const EXPECTED_FORM_KEYS = 9;
    const formDetails        = getFormData(form)
    
    const totalKeys = Object.keys(formDetails).length;

    if (totalKeys !== EXPECTED_FORM_KEYS) {
        throw new Error(`Expected ${EXPECTED_FORM_KEYS} keys but got ${totalKeys}. Object: ${JSON.stringify(formDetails)}`);
    }

    if (!form.checkValidity()) {
        error.classList.remove("display");

    } else {
        e.preventDefault();
        error.classList.add("display");
        
        const TIME_IN_MILLSECONDS_TO_DISPLAY = 1000;

        toggleSpinner(spinner2);

        setTimeout(() => {

            renderOrderSummary(formDetails);
            showPurchasedOrders();
            
            orderConfirmationSection.classList.add("show");
            paymentSection.classList.remove("show");

            toggleSpinner(spinner2, false);

        }, TIME_IN_MILLSECONDS_TO_DISPLAY);
       
    }

}


function renderOrderSummary(formDetails) {
    
    const billingAddress          = getFullAddress(formDetails);
    const maskedCreditCardNo      = maskCreditCardNo(formDetails.creditCardNo);
    const deliveryDate            = getDeliveryDate(5);
    const fullName                = getFullName(formDetails)

    const cardDetailsTextNode     = document.createTextNode(maskedCreditCardNo);
    const billingAddressTextNode  = document.createTextNode(billingAddress);
    const deliveryAddressTextNode = document.createTextNode(deliveryDate);
    const fullNameTextNode        = document.createTextNode(fullName)

    cardDetailsElement.appendChild(cardDetailsTextNode);
    billingAddressElement.appendChild(billingAddressTextNode);
    deliveryDateElement.appendChild(deliveryAddressTextNode);
    fullNameElement.appendChild(fullNameTextNode);
   
}


function getFormData(form) {
    const formData = new FormData(form);
    return {
        title: formData.get("title"),
        suffix: formData.get("suffix"),
        name: formData.get("full-name"),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        postcode: formData.get("zip"),
        nameOnCard: formData.get("name-on-card"),
        creditCardNo: formData.get("credit-card-no")
    };
}


function getFullAddress(formDetails) {
    return `${formDetails.address} ${formDetails.city} ${formDetails.state} ${formDetails.postcode}`;
}


function getFullName(formDetails) {
    const suffix = formDetails.suffix === "None" ? null : formDetails.suffix;

    if (suffix) {
        return `${formDetails.title} ${formDetails.suffix} ${formDetails.name}`;
    }
    return `${formDetails.title} ${formDetails.name}`;
}


function getDeliveryDate(daysUntilDelivery = 1) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + daysUntilDelivery);
    return currentDate;
}


function showPurchasedOrders() {
    const purchasedOrders    = getLocalStorage(PRODUCT_STORAGE_KEY);
    const totalOrder         = createOrdersDiv(purchasedOrders);
    const totalOrderTextNode = document.createTextNode(`£${totalOrder}`);

    totalOrderCostElement.appendChild(totalOrderTextNode);
    
}


function validatePageElements() {
    checkIfHTMLElement(form, "payment form");
    checkIfHTMLElement(creditNoField, "Credit card number field");
    checkIfHTMLElement(spinner2, "Spinner 2 Element");
    checkIfHTMLElement(paymentSection, "The payment section element");
    checkIfHTMLElement(orderConfirmationSection, "The order confirmation section element");
    checkIfHTMLElement(fullNameElement, "The full name element");
    checkIfHTMLElement(totalOrderCostElement, "The total order cost element");
}
