// All communication with Payal's existing diamond API lives here.
// Base URL and API key come from .env (PAYAL_API_URL, PAYAL_API_KEY).

// Fetch full diamond catalog with optional filters (shape, carat, price, etc.)
export async function getDiamonds(filters = {}) {
  // TODO: build query string from filters object
  // TODO: GET ${PAYAL_API_URL}/diamonds with Authorization header
  // TODO: return parsed diamond array
}

// Fetch a single diamond by its ID
export async function getDiamondById(id) {
  // TODO: GET ${PAYAL_API_URL}/diamonds/${id}
  // TODO: return parsed diamond object
  // TODO: throw 404 error if not found
}

// Submit a new order to Payal's API
export async function createOrder(orderData) {
  // TODO: POST ${PAYAL_API_URL}/orders with orderData payload
  // TODO: return Payal's order ID + confirmation details
  // TODO: throw error if Payal rejects the order
}
