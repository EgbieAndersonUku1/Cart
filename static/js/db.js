import {findProductBySelector, filterItemsById } from "./utils.js";


export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage set error:', error);
    }
}


export function getLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('LocalStorage get error:', error);
        return [];
    }
}



export function removeFromLocalStorage(key, id) {
    const items = getLocalStorage(key);

    if (items && Array.isArray(items)) {
        const newItems = filterItemsById(items, id);

        if (newItems.length !== items.length) { 
            setLocalStorage(key, newItems);
        } else {
            console.log(`Item with id ${id} was not found in ${key}.`);
        }

    } else {
        console.log(`Attempted to remove item with id ${id} but the key "${key}" does not exist or is not an array.`);
    }
}



export function updateProductInLocalStorage(key, productInfo, productID) {
    const NOT_FOUND = -1;

    if (productInfo && productInfo.productIDName && productInfo.currentQty && productInfo.currentPrice && productInfo.productName) {

        const products = getLocalStorage(key);
        const index    = findProductBySelector(products, productID);

      
        const value    = {
            productIDName: productInfo.productIDName,
            productName: productInfo.productName,
            currentQty: productInfo.currentQty,
            currentPrice: productInfo.currentPrice,
            selectorID: productID,
        };
        
        if (index === NOT_FOUND) {
            products.push(value);
        } else {
            products[index] = value;
        }
        
        setLocalStorage(key, products);
        
    } else {
        console.warn(`One or more fo the elements wasn't found: name: ${productInfo.productIDName}, element: ${currentProductQtyElement}, qty: ${currentQty}, price: ${currentPrice}`)
    }

}


