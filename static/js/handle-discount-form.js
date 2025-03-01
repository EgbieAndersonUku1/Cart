import { extractCurrencyAndValue, 
        concatenateWithDelimiter,
         showSpinnerFor, 
         checkIfHTMLElement } from "./utils.js";
import { showPopupMessage } from "./messages.js";

const spinner    = document.getElementById("spinner");
const orderTotal = document.getElementById("order-total");


validatePageElements();


/**
 * Formats input text by inserting a dash ('-') at specified intervals.
 * 
 * This function listens for input changes and automatically adds dashes 
 * after every specified number of characters. It also provides an option
 * to keep only digits by removing all non-numeric characters.
 * 
 * @param {Event} e - The input event containing the target value.
 * @param {number} lengthPerDash - The number of characters between dashes (default: 5).
 * @param {boolean} digitsOnly - If true, removes all non-numeric characters (default: false).
 */
export function applyDashToInput(e, lengthPerDash=5, digitsOnly=false) {
  
    const value = e.target.value.trim();

    if (!value) return;
    if (!Number.isInteger(lengthPerDash)) {
        console.error(`The lengthPerDash must be integer. Expected an integer but got ${typeof lengthPerDash}`);
    };

    let santizeValue   = sanitizeText(value, digitsOnly);
    let formattedText  = [];


    for (let i=0; i < santizeValue.length; i++) {

        const fieldValue = santizeValue[i];
    
        if (i > 0 && i % lengthPerDash === 0 ) {
            formattedText.push(concatenateWithDelimiter("-", fieldValue));
        } else {
            formattedText.push(fieldValue);
            
        }
    }

   e.target.value = formattedText.join("");
   
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
    _currentDiscountCode: null,

    /**
     * Applies a discount to the cart total if the provided code is valid and has not already been applied.
     * 
     * @param {string} code - The discount code entered by the user.
     * @param {boolean} allowReapply - If true, allows reapplying the discount even if it's already applied.
     * @returns {boolean} - Returns `true` if the discount is successfully applied, otherwise `false`.
     */
    applyDiscount: (code, allowReapply = false) => {

        if (!code) return;

        const discountPercentage = discountManager._getDiscountPercentage(code);

        if (discountPercentage !== undefined) {
            showSpinnerFor(spinner);

            if (discountManager.isDiscountApplied() && !allowReapply) {
                const msg = "This discount has already been applied.";
                showPopupMessage(msg);
                return false;
            }

            discountManager._discountApplied = true;

            const cartTotal      = discountManager._getCartTotal();
            const discountAmount = (discountPercentage / 100) * cartTotal;
            const newTotal       = cartTotal - discountAmount;

            discountManager._renderNewTotal(newTotal, discountPercentage);
            return true;
        }
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

        const discountCode = discountManager._discounts[normalisedCode];

        if (discountCode) {
            discountManager._currentDiscountCode = normalisedCode;
        }
        return discountCode;

    },

    /**
    * Retrieves the discount code currently applied.
    * @returns {string|null} The applied discount code, or null if no discount is applied.
    */
     getCurrentAppliedDiscountCode: () => {
        return discountManager._currentDiscountCode;

    },

    /**
     * Checks if a discount has already been applied.
     * 
     * @returns {boolean} - Returns `true` if the discount is already applied, otherwise `false`.
     */
    isDiscountApplied: () => {
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



function sanitizeText(text, onlyNumbers=false) {
    if (onlyNumbers) {
        const digitsOnly = text.replace(/\D+/g, "");
        return digitsOnly;
    }
    return text?.split("-").join("");
}


function validatePageElements() {
    if (!checkIfHTMLElement(spinner, "spinner")) return;
    if (!checkIfHTMLElement(orderTotal, "OrderTotal")) return;
}