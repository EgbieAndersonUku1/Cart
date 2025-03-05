const iconCartQuantity     = document.getElementById("icon-cart-quantity");
const dimBackgroundElement = document.getElementById("dim");


validatePageElements();


/**
 * Splits a string using a specified delimiter.
 * @param {string} text - The text to be split.
 * @param {string} [delimiter="-"] - The delimiter to use for splitting. Defaults to "-".
 * @returns {string[]} - An array of substrings.
 */
export function splitText(text, delimiter = "-") {
    return text ? text.split(delimiter) : [];
}


/**
 * Concatenates two strings with a delimiter in between.
 * @param {string} first     - The first string.
 * @param {string} second    - The second string.
 * @param {string} delimiter - The delimiter to use if none is provide concatenates the two strings.
 * @returns {string}         - The concatenated string.
 */
export function concatenateWithDelimiter(first, second, delimiter = "") {
    return `${first}${delimiter}${second}`;
}


export function checkIfHTMLElement(element, elementName = "Unknown") {
    if (!(element instanceof HTMLElement)) {
        console.error(`Could not find the element: '${elementName}'. Ensure the selector is correct.`);
        return false;
    }
    return true;
}


/**
 * Toggles the visibility of the spinner.
 * 
 * This function shows or hides the spinner by setting its display property to either 'block' or 'none'.
 * 
 * @param {boolean} [show=true] - A boolean indicating whether to show or hide the spinner.
 *                               If `true`, the spinner is shown; if `false`, it is hidden.
 */
export function toggleSpinner(spinnerElement, show=true) {
    if (!checkIfHTMLElement(spinnerElement)) {
        console.error("Missing spinner element");
    }
    spinnerElement.style.display = show ? "block"  : "none";
    toggleScrolling(show);
}


/**
 * Shows the spinner for a specified duration and then hides it.
 * 
 * This function uses the `toggleSpinner` function to show the spinner immediately,
 * and then hides it after the specified amount of time (default is 500ms).
 * 
 * @param {HTMLElement} spinnerElement - The spinner element to display.
 * @param {number} [timeToDisplay=500] - The duration (in milliseconds) to display the spinner. Defaults to 500ms.
 */
export function showSpinnerFor(spinnerElement, timeToDisplay = 500) {
    toggleSpinner(spinnerElement); 

    setTimeout(() => {
        toggleSpinner(spinnerElement, false);  
    }, timeToDisplay);
}



export function showPopup(element, duration=500) {
    element.classList.add("popup");

    setTimeout(() => {
        element.classList.remove("popup");
    }, duration);

}


export function findProductBySelector(products, selectorID) {
    return products.findIndex((product) => product.selectorID === selectorID);       
}


export function filterItemsById(items, id) {
    return items.filter((item) => item.productIDName !== id);
}


export function toggleScrolling(disable) {
    document.body.style.overflow = disable ? "hidden" : "auto";
}


export function extractCurrencyAndValue(priceStr) {
    const currencySymbol = priceStr.charAt(0);  
    const numericValue   = priceStr.slice(1);  
    const currentPrice = parseFloat(numericValue, 10) || 0;  

    return {
        currency: currencySymbol,
        amount: currentPrice
    };
}


export function setCartNavIconQuantity(amount) {
    iconCartQuantity.textContent = amount;
}

export function dimBackground(dim=false) {
    dimBackgroundElement.style.display  = dim ? "block" : "none";
};




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


export function sanitizeText(text, onlyNumbers=false) {
    if (onlyNumbers) {
        const digitsOnly = text.replace(/\D+/g, "");
        return digitsOnly;
    }
    return text?.split("-").join("");
}



/**
 * Masks a credit card number, hiding all but the last four digits.
 *
 * The function replaces the leading digits with '*' while keeping the last four digits visible.
 * It ensures that the credit card number is within a valid range (12 to 19 digits) and that
 * it contains non-numeric characters.
 *
 * @param {string} creditCardNo - The credit card number to be masked.
 * @returns {string} The masked credit card number.
 * @throws {Error} If the input is not a string or has an invalid length.
 * @throws {Error} If the input are non-numeric characters
 *
 * @example
 * maskCreditCardNo("1234567812345678"); // "************5678"
 * maskCreditCardNo("378282246310005");  // "***********0005" (Amex)
 * maskCreditCardNo("30569309025904");   // "**********5904" (Diners Club)
 */
export function maskCreditCardNo(creditCardNo) {
    if (!creditCardNo || typeof creditCardNo !== "string") {
        throw new Error("Invalid credit card number");
    }

    const CREDIT_CARD_LENGTH      = sanitizeText(creditCardNo, true).length;
    const MIN_CREDIT_CARD_LENGTH  = 12;
    const MAX_CREDIT_CARD_LENGTH  = 19;
  
    
    if (CREDIT_CARD_LENGTH < MIN_CREDIT_CARD_LENGTH ) {
        throw new Error(`The credit card is invalid because it contains non-numeric values. Credit card no: ${creditCardNo}`);
    };

    if (CREDIT_CARD_LENGTH > MAX_CREDIT_CARD_LENGTH) {
        throw new Error("Credit card length must be: Visa, Mastercard, Discover: 16, American Express: 15, Diners Club: 14, Maestro: 12 to 19");
    }

    const numberToMask   = CREDIT_CARD_LENGTH - 4;
    const maskedNumber   = "*".repeat(numberToMask);
    const lastFourDigits = creditCardNo.slice(-4);

    return concatenateWithDelimiter(maskedNumber, lastFourDigits);
};



function validatePageElements() {
    if (!checkIfHTMLElement(iconCartQuantity, "Cart quantity")) return;
    if (!checkIfHTMLElement(dimBackgroundElement, "dim background element")) return;
   
}