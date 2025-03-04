import { checkIfHTMLElement, concatenateWithDelimiter } from "./utils.js";

const cardsDiv    = document.querySelector("#saved-products .cards");
const sideBarMsg  = document.querySelector(".save-sidebar-msg");
const ordersDiv   = document.getElementById("orders");


validateCardDiv();


function validateCardDiv() {
    if (!checkIfHTMLElement(cardsDiv, "Cards div")) {
        return;
    };
    if (!checkIfHTMLElement(sideBarMsg, "The sidebar message")) {
        return;
    };

    if (!checkIfHTMLElement(ordersDiv, "The purchase orders div")) {
        return;
    };

};


export const cardsContainer = {
    add: (cardDiv) => {
        if (!checkIfHTMLElement(cardDiv, "Card")) return; 

        if (sideBarMsg.textContent) {
            sideBarMsg.remove();
        }
        cardsDiv.appendChild(cardDiv);
    }
}



export function createOrdersDiv(orders) {
    
    ordersDiv.classList.add("order", "padding-bottom-sm");
    
    orders.forEach((order) => {

        try {
            const orderDiv = createOrderDiv(order);
            ordersDiv.appendChild(orderDiv);

        } catch (error) {
            console.warn(error);
        }
    
    })

    return ordersDiv;
}



function createOrderDiv(order) {
   
    if (!order || typeof order != "object") {
        throw new Error(`Expected an object but got type: ${typeof order}`);
    }

    const orderDiv         = document.createElement("div");
    const ulElement        = document.createElement("ul");

    ulElement.className    = "highlight-box";
    orderDiv.className     = "padding-bottom-md";

    const MAX_RANDOM_VALUE = 500;
    const PRODUCT_ID       = order.productIDName || '';
    const ulID             = PRODUCT_ID.slice(-1) || Math.floor(Math.random() * MAX_RANDOM_VALUE);
    ulElement.id           = concatenateWithDelimiter("order", ulID, "-");
    
    const PRODUCT_KEY_MAPPING = {
        "currentQty" : "Quantity purchased : ",
        "productIDName" : "Product ID: ",
        "productName" : "Product name",
        "currentPrice" : "Price",
        "selectorID" : '',
    }

    // create ul and ol 
    for (const key in order) {

        const liElement   = document.createElement("ol");
        const spanElement = document.createElement("span");
        const value       = order[key];
        let textNode;

        spanElement.className   = "medium-bold"
        spanElement.textContent =  PRODUCT_KEY_MAPPING[key];

        liElement.appendChild(spanElement)
        
        if (key !== "selectorID") {
           
            if (key === PRODUCT_ID) {
            
                textNode = document.createTextNode(value ? ` ${value}  `: ulID);

            } else {
          
                textNode = document.createTextNode(value ? ` ${value} `: `${key} is not found`);
            }

            liElement.classList.add("padding-left-md");
            liElement.appendChild(textNode)
            ulElement.appendChild(liElement);
       }

    };
    orderDiv.appendChild(ulElement);
    return orderDiv;


}


export function createProductCard(productInfo) {
    
    const cardMainDiv = document.createElement("div");
    const cardHead    = createCardHead(productInfo);
    const cardBody    = createCardBody(productInfo);
    
    cardMainDiv.className = "card";
    cardMainDiv.appendChild(cardHead);
    cardMainDiv.appendChild(cardBody);

    return cardMainDiv;

};


function createCardHead(productInfo) {

    const cardHeadDiv   = document.createElement("div");
    const h2Element     = document.createElement("h2");
    const anchorElement = document.createElement("a");

    h2Element.textContent     = productInfo.productName;
    h2Element.className       = "capitalize";

    anchorElement.href        = "#";
    anchorElement.className   = "remove-card-link";
    anchorElement.textContent = "Remove product";

    cardHeadDiv.classList.add("head", "flex-space-between");

    cardHeadDiv.appendChild(h2Element);
    cardHeadDiv.appendChild(anchorElement);

    return cardHeadDiv;

}


function createCardBody(productInfo) {

    const cardBody = document.createElement("div");

    if (typeof productInfo !== 'object' || productInfo === null) {
        console.warn(`Expected a product object but got: ${typeof productInfo}`);
        return;
    }

    Object.keys(productInfo).forEach((key) => {

        if (key != "currentProductQtyElement") {
            const pTag = createPTag(key, productInfo[key]);
            cardBody.appendChild(pTag)
        }        
    })

    return cardBody;

}


/**
 * Creates a <p> element with a nested <span> element containing the provided key.
 * The span will have the "capitalize" and "bold" CSS classes applied.
 * The text content after the span will be the corresponding value from productInfo, or
 *  "Not found" if the key is not present.
 *
 * Example output:
 * <p><span class="capitalize bold">Current Price:</span> £999</p>
 *
 * @param {string} key - The label for the product information (e.g., "Current Price").
 * @param {object} value - The value for the key e.g £20
 * @returns {HTMLElement} The generated <p> element containing the product information.
 */
function createPTag(key, value) {

    const pTag       = document.createElement("p");
    const span       = document.createElement("span");
    span.textContent = key + ": "; 

    span.classList.add("capitalize", "bold");
   
    pTag.appendChild(span);

    const textNode = document.createTextNode(value ?? "Not found");
    pTag.appendChild(textNode);

    return pTag;
}
