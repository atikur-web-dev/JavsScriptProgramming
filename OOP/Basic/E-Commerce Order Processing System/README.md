#  E-Commerce Order Processing System

An object-oriented E-Commerce Order Processing System built with **JavaScript and TypeScript** to practice OOP principles, encapsulation, inheritance, polymorphism, abstraction, design patterns, asynchronous programming, and JavaScript event loop behavior.

##  Project Overview

The system manages products, customers, orders, and order processing through six main entities and a closure-based alternative implementation of `Customer`.

### Core Entities

1. `ShopError` — Custom error class.
2. `Product` — Abstract base class.
3. `PhysicalProduct` — Physical products with shipping costs.
4. `DigitalProduct` — Digital products without shipping costs.
5. `SubscriptionProduct` — Subscription products with duration and discounts.
6. `Customer` — Customer information and order history.
7. `Order` — Order items, discounts, totals, and status management.
8. `OrderProcessor` — Centralized management of products, customers, and orders.

**Additional implementations:**
- Closure-based `Customer` implementation.
- Prototype-based `DigitalProduct` implementation in JavaScript.

---

## 1. ShopError — Custom Error

Create a custom error class that extends JavaScript's built-in `Error` class.

### Requirements

- Extend `Error`.
- Set the error name to `"ShopError"`.
- Use `ShopError` for validation errors throughout the system.

---

## 2. Product — Abstract Base Class

The `Product` class serves as the base class for all product types.

### Properties

| Property | Requirements |
|---|---|
| `sku` | Automatically generated, unique, immutable identifier. |
| `name` | Private property with a getter and a validating setter; minimum 3 characters. |
| `basePrice` | Private property; must be a positive number. |
| `stock` | Private property; must be a non-negative integer. |
| Global product counter | Incremented whenever a product is successfully created. |

### Methods

| Method | Description |
|---|---|
| `getFinalPrice()` | Abstract method that subclasses must implement. |
| `isInStock()` | Returns whether stock is greater than zero. |
| `reduceStock(quantity)` | Reduces stock by the specified quantity; invalid quantities throw `ShopError`. |
| `getInfo()` | Returns `"[sku] [name] - $[basePrice] (Stock: [stock])"`. |
| `static create(type, name, basePrice, stock, extra)` | Factory method for creating product instances. |
| `static getTotalProducts()` | Returns the total number of products created. |

### Special Requirements

- Prevent direct instantiation of the abstract `Product` class.
- Implement `sku` using `Object.defineProperty()`.
- Make `sku` non-writable and non-configurable.
- Use private fields for sensitive properties.
- Override `getInfo()` in every subclass to include subclass-specific information.

---

## 3. Product Subclasses

### 3.1 PhysicalProduct

Represents physical products that require shipping.

**Additional property:**
- `weight` — Private property representing weight in kilograms.

**Methods:**
- Calculate shipping cost as `weight × $2`.
- Implement `getFinalPrice()` as:

  `basePrice + shippingCost`

- Override `getInfo()` to include weight and shipping information.

### 3.2 DigitalProduct

Represents downloadable digital products.

**Additional property:**
- `fileSize` — Private property representing file size in megabytes.

**Methods:**
- No shipping cost.
- Implement `getFinalPrice()` as:

  `basePrice`

- Override `getInfo()` to include file size information.

**Prototype Requirement:**

Implement `DigitalProduct` in two ways:

1. Using a JavaScript class.
2. Using a constructor function and `prototype` methods without the `class` keyword.

For TypeScript, use the class-based implementation.

### 3.3 SubscriptionProduct

Represents subscription-based products.

**Additional properties:**
- `duration` — Private property representing subscription duration in months.
- `discountPercent` — Private property; must be between 0 and 100.

**Method:**

Calculate the final price using:

`basePrice × duration × (1 - discountPercent / 100)`

Override `getInfo()` to include subscription duration and discount information.

---

## 4. Customer

The `Customer` entity manages customer information and order history.

### Properties

| Property | Requirements |
|---|---|
| `customerId` | Automatically generated, unique, immutable identifier. |
| `name` | Private property with validation. |
| `email` | Private property with basic validation; must contain `@`. |
| `orderHistory` | Private array containing the customer's orders. |

### Methods

| Method | Description |
|---|---|
| `addOrder(order)` | Adds an order to the customer's history and returns `this` for method chaining. |
| `getOrderHistory()` | Returns a defensive copy of the order history. |
| `getTotalSpent()` | Returns the sum of the totals of all customer orders. |
| `getInfo()` | Returns `"[customerId] [name] ([email]) - Orders: [count]"`. |

### Special Requirements

- Implement `customerId` using `Object.defineProperty()`.
- Make `customerId` non-writable and non-configurable.
- Ensure that `getOrderHistory()` does not expose the original internal array.
- Make `getTotalSpent()` safe to call when detached from its original object by using `bind()` or an arrow-function approach.

### Alternative Implementation: Closure-Based Customer

Implement `Customer` in two ways:

1. Class-based implementation using private fields.
2. Closure-based implementation using private variables and returned methods.

The closure implementation must protect internal customer data from direct external access.

---

## 5. Order

The `Order` entity manages products, quantities, discounts, totals, and order status.

### Properties

| Property | Requirements |
|---|---|
| `orderId` | Automatically generated, unique, immutable identifier. |
| `customer` | Must be a valid `Customer` instance. |
| `items` | Private array of `{ product, quantity }` objects. |
| `status` | Controlled through a getter and setter. |
| `discountPercent` | Private property; defaults to `0` and must be between 0 and 100. |

### Valid Order Statuses

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

The initial status must be `pending`.

### Methods

| Method | Description |
|---|---|
| `addItem(product, quantity)` | Validates the product and quantity, checks stock availability, adds the item, reduces stock, and returns `this`. |
| `applyDiscount(percent)` | Validates and applies a discount between 0 and 100; returns `this`. |
| `getSubtotal()` | Calculates the sum of `product.getFinalPrice() × quantity` for all items. |
| `getTotal()` | Calculates the subtotal after applying the percentage discount. |
| `updateStatus(newStatus)` | Updates the order status only when the transition is valid. |
| `cancel()` | Cancels an order only when its status is `pending` or `processing`. |
| `getItems()` | Returns a defensive copy of the order items. |
| `getInfo()` | Returns `"Order [orderId] - [customer.name] - [status] - $[total]"`. |

### Valid Status Transitions

The normal order workflow is:

`pending → processing → shipped → delivered`

Cancellation is allowed only from `pending` or `processing`.

Invalid status values and transitions must throw `ShopError`.

### Special Requirements

- Implement `orderId` using `Object.defineProperty()`.
- Make `orderId` non-writable and non-configurable.
- Control status changes through a getter and setter.
- Ensure returned item arrays cannot directly modify the internal items array.

---

## 6. OrderProcessor

The `OrderProcessor` is the central manager and single source of truth for products, customers, and orders.

### Private Properties

| Property | Data Structure | Purpose |
|---|---|---|
| `#orders` | `Map` | Stores orders using `orderId` as the key. |
| `#customers` | `Map` | Stores customers using `customerId` as the key. |
| `#products` | `Map` | Stores products using `sku` as the key. |

### Methods

| Method | Description |
|---|---|
| `registerCustomer(customer)` | Validates the customer, rejects duplicate IDs, and registers the customer. |
| `registerProduct(product)` | Validates the product, rejects duplicate SKUs, and registers the product. |
| `placeOrder(customerId, items)` | Asynchronously creates and registers an order for a registered customer. |
| `processOrder(orderId)` | Asynchronously processes an order, updates its status, and ships it. |
| `cancelOrder(orderId)` | Cancels an eligible order and restores its reserved product stock. |
| `getOrder(orderId)` | Returns the requested order or throws `ShopError` if it does not exist. |
| `getAllOrders()` | Returns a defensive copy of all registered orders. |
| `getTotalRevenue()` | Returns the total of all non-cancelled orders. |
| `getOrdersByStatus(status)` | Returns orders matching the specified status. |
| `simulateBatchProcessing(orderIds)` | Demonstrates microtask and macrotask execution order before processing orders sequentially. |

### Asynchronous Requirements

**`placeOrder(customerId, items)`**
1. Validate the customer ID.
2. Find the registered customer.
3. Create an order.
4. Add the requested products and quantities.
5. Add the order to the customer's order history.
6. Register the order in the central orders map.
7. Simulate a 100 ms delay.
8. Return the created order.

**`processOrder(orderId)`**
1. Find the registered order.
2. Validate whether processing can begin.
3. Update the status to `processing`.
4. Simulate a 200 ms delay.
5. Update the status to `shipped`.

**`cancelOrder(orderId)`**
1. Find the registered order.
2. Verify that cancellation is allowed.
3. Cancel the order.
4. Restore the stock reserved by its items.

### Data Integrity Requirements

- Use private `Map` instances to manage registered entities.
- Reject duplicate customer IDs and product SKUs.
- Return copies when exposing collections.
- Throw `ShopError` when an entity cannot be found or a validation fails.
- Keep registered orders, customers, and products consistent.

---

## 7. Event Loop — Batch Processing

Implement `simulateBatchProcessing(orderIds)` inside `OrderProcessor`.

### Execution Requirements

1. Schedule a microtask to log:

   `batch: validating orders`

2. Schedule a macrotask using `setTimeout(..., 0)` to log:

   `batch: processing started`

3. Process the supplied orders sequentially.

4. After all orders have been processed, schedule a microtask to log:

   `batch: completed`

### Expected Log Order

```text
batch: validating orders
batch: processing started
processing logs...
batch: completed
```

### Important Notes

- Use `queueMicrotask()` or an equivalent Promise-based approach.
- Use `setTimeout(..., 0)` for the macrotask.
- Await each order-processing operation inside a sequential loop.
- Ensure the completion message appears only after all requested orders have finished processing.
- Handle processing errors appropriately.

---

## 8. Object-Oriented Programming Concepts

The project should demonstrate the following concepts:

| Concept | Application |
|---|---|
| Encapsulation | Private fields and controlled access to internal data. |
| Abstraction | Abstract `Product` base class and `getFinalPrice()` contract. |
| Inheritance | Product subclasses extending `Product`. |
| Polymorphism | Each product type implements its own pricing and information methods. |
| Composition | Orders contain products, and customers maintain order histories. |
| Factory Pattern | `Product.create()` creates the appropriate product subtype. |
| Custom Errors | `ShopError` handles validation and domain errors. |
| Method Chaining | `Customer.addOrder()`, `Order.addItem()`, and `Order.applyDiscount()`. |
| Defensive Copying | Collection-returning methods protect internal arrays. |
| Immutable Properties | IDs and SKUs cannot be reassigned or reconfigured. |
| Closures | Alternative implementation of `Customer`. |
| Prototypes | Alternative JavaScript implementation of `DigitalProduct`. |
| Asynchronous Programming | `async`, `await`, Promises, and simulated processing delays. |
| Event Loop | Demonstration of microtask and macrotask scheduling. |
| Static Members | Global product counter and `Product.getTotalProducts()`. |
| Maps | Centralized entity registration and lookup. |
| Getters and Setters | Controlled access to `Product.name` and `Order.status`. |

---

## 9. Validation Rules

The system must validate user input and maintain consistent application state.

Examples of invalid operations include:

- Creating a `Product` directly.
- Using a product name shorter than three characters.
- Providing a non-positive product price.
- Providing a negative or non-integer stock quantity.
- Reducing stock below zero.
- Using an invalid product weight, file size, duration, or discount.
- Registering duplicate products or customers.
- Creating an order for an unregistered customer.
- Adding an invalid product or quantity to an order.
- Ordering more items than are available.
- Applying a discount outside the range of 0–100.
- Performing an invalid order status transition.
- Cancelling an order after it has shipped.
- Retrieving an order that does not exist.

All validation failures must use `ShopError`.



