# Cart System

## Overview

This project is a minimal cart system designed to handle frontend interactions using JavaScript and communicate with the backend via the Fetch API. The goal for this is to focus on the core functionality of managing cart items without building a full e-commerce application, hence which is why the cart page is only built.

## Features

- **Frontend Handling**: JavaScript dynamically updates the cart when items are added, saved, or removed.
- **Fetch API Integration**: The system sends cart data to the backend for processing.
- **Preloaded Items**: The cart starts with two dummy products for demonstration purposes.
- **Minimal Backend Dependency**: The backend receives and processes cart updates but does not include a full application structure.
- **Add a discount code**: Allows the user to enter a discount code of either 50% 20% or 10%


## DISCOUNT CODES 

Use any one of these codes to get a discount.

```sh
  - **EGBIE-GET50-PERCE-NTOFF** – 50% discount
  - **EGBIE-SUMME-RSALE-20OFF** – 20% discount
  - **EGBIE-GET10-OFFFI-RSTIM** – 10% discount

```

*Note: Since this project does not contain a backend, so the discount codes are static and predefined.*


## Project Structure

- **`index.html`**: Contains the basic layout for the cart interface.
- **`cart.js`**: Handles adding, saving, and updating cart items using JavaScript.
- **`backend with django`** No login, registration, etc only the cart related functionalities will be added.

## Installation & Usage

1. Clone the repository:
   ```sh
   git clone https://github.com/EgbieAndersonUku1/Cart.git 
   cd cart
   ```
2. Open `index.html` in a browser to interact with the cart.


## To do
- Add the backend which only go to be cart related functionalities
- Make the JS functional e.g. clicking the buttons, fetch, etc
- Add Footer

## Notes

This project is intentionally limited in scope. The focus is on developing a functional cart system that communicates with a backend, rather than a fully-fledged e-commerce solution. Only a basic cart item structure is implemented, with two dummy products preloaded for testing. Also the site is not responsible on smaller device e.g mobile, tablets, etc because the responsive element hasn't been added.


## View site
https://egbieandersonuku1.github.io/Cart/
