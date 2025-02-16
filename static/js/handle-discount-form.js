import { extractCurrencyAndValue, 
        concatenateWithDelimiter,
         showSpinnerFor, 
         checkIfHTMLElement } from "./utils.js";
import { showPopupMessage } from "./messages.js";

const spinner    = document.getElementById("spinner");
const orderTotal = document.getElementById("order-total");


validatePageElements();

/**
 * Applies a dash ('-') to the input text after every 5th character.
 * 
 * This function listens for input changes and automatically formats the text
 * by adding dashes after every 5 characters. 
 * 
 * @param {Event} e - The event triggered by the input change.
 * This event object contains the input value that will be formatted.
 */
export function applyDashToInput(e) {
  
    const value = e.target.value;

    if (!value) return;

    let santizeValue = sanitizeText(value);
    let text         = "";

    for (let i=0; i < santizeValue.length; i++) {

        const fieldValue = santizeValue[i];
    
        if (i > 0 && i % 5 === 0 ) {
            text += `-${fieldValue}`;
        } else {
            text += fieldValue
        }
    }

   e.target.value = text;
   
};

/**
 * Manages the application of discount codes and their corresponding percentages.
 */
export const discountManager = {
    _discounts: {
        "EGBIE-GET50-PERCE-NTOFF": 50, //  50% discount
        "EGBIE-SUMME-RSALE-20OFF": 20,  //   20% discount
        "EGBIE-GET10-OFFFI-RSTIM": 10  //   10% discount
    },
    _discountApplied: false,
    _currency: null,

    /**
     * Applies a discount to the cart total if the provided code is valid and has not already been applied.
     * 
     * @param {string} code - The discount code entered by the user.
     * @returns {boolean} - Returns `true` if the discount is successfully applied, otherwise `false`.
     */
    applyDiscount: (code) => {

        if (!code) return;

        const discountPercentage = discountManager._getDiscountPercentage(code);

        if (discountPercentage !== undefined) {
            showSpinnerFor(spinner);

            if (discountManager._isDiscountApplied()) {
                const msg = "This discount has already been applied.";
                showPopupMessage(msg);
                return false;
            }

            discountManager._discountApplied = true;

            const cartTotal = discountManager._getCartTotal();
            const discountAmount = (discountPercentage / 100) * cartTotal;
            const newTotal = cartTotal - discountAmount;

            discountManager._renderNewTotal(newTotal, discountPercentage);
            return true;
        }

        const msg = "The discount code you entered is invalid.";
        showPopupMessage(msg);
        return false;
    },

    /**
     * Gets the discount percentage associated with a given discount code (case-insensitive).
     * 
     * @param {string} code - The discount code entered by the user.
     * @returns {number|undefined} - Returns the discount percentage if valid, otherwise `undefined`.
     */
    _getDiscountPercentage: (code) => {
        if (!code) return undefined;

        // Normalise the code to uppercase to handle case-insensitive matches
        const normalisedCode = code.toUpperCase();
        return discountManager._discounts[normalisedCode];
    },

    /**
     * Checks if a discount has already been applied.
     * 
     * @returns {boolean} - Returns `true` if the discount is already applied, otherwise `false`.
     */
    _isDiscountApplied: () => {
        return discountManager._discountApplied;
    },

    /**
     * Retrieves the current total of the cart and extracts the currency and amount.
     * 
     * @returns {number} - The total amount of the cart. Returns `0` if no total is found.
     */
    _getCartTotal: () => {
        const priceData = extractCurrencyAndValue(orderTotal.textContent);
        if (priceData) {
            discountManager._currency = priceData.currency;
            return priceData.amount;
        }
        return 0;
    },

    /**
     * Updates the displayed cart total with the new discounted amount.
     * 
     * @param {number} amount - The new total after applying the discount.
     * @param {number} discountPercentage - The percentage of the applied discount.
     */
    _renderNewTotal: (amount, discountPercentage) => {
        const msg = `Your ${discountPercentage}% discount has been successfully applied.`;
        showPopupMessage(msg);
        orderTotal.textContent = concatenateWithDelimiter(discountManager._currency, amount);
    },
};



/**
 * Extracts a discount code from a form.
 * 
 * This function retrieves a discount code from a given form using the specified
 * form field name. If the discount code is not found, or if an error occurs during
 * the extraction process, `null` is returned.
 * 
 * @param {HTMLFormElement} form - The form element from which to extract the discount code.
 * @param {string} [name="discountCode"] - The name of the form field containing the discount code.
 * @returns {string|null} - The discount code if found, otherwise `null`.
 * 
 * @throws {Error} - Logs an error to the console if an exception occurs while accessing form data.
 */
export function extractDiscountCodeFromForm(form, name="discountCode") {
    try {
        const formData = new FormData(form);
        const { code } = { code: formData.get(name) };

        return code || null;  

    } catch (error) {
        console.error(error.message);
        return null;  
    }
}



function sanitizeText(text) {
    return text?.split("-").join("");
}


function validatePageElements() {
    if (!checkIfHTMLElement(spinner, "spinner")) return;
    if (!checkIfHTMLElement(orderTotal, "OrderTotal")) return;
}