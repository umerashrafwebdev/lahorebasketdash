// src/app/(admin)/orders/[id]/page.jsx
import axios from 'axios';

export default async function OrderDetail({ params }) {
  const { id } = params;

  let order = null;
  let products = null;
  let error = null;

  // Define variant IDs to filter by (optional)
  const variantIdsToFilter = [1, 2, 3]; // Example: only show items with these variant IDs

  try {
    // Fetch order details
    const orderResponse = await axios.get(`https://api.g3studio.co/api/orders/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    order = orderResponse.data.order || orderResponse.data;

    // Fetch products
    const productsResponse = await axios.get('https://api.g3studio.co/api/products', {
      headers: { 'Content-Type': 'application/json' },
    });
    products = productsResponse.data.products || productsResponse.data;
  } catch (err) {
    console.error('Error fetching data:', err);
    error = 'Failed to load order details. Please try again.';
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger border-start border-4 border-danger shadow-sm" role="alert">
          <strong className="fs-5">Oops!</strong> {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-secondary text-center shadow-sm" role="alert">
          <strong className="fs-5">Order not found.</strong>
        </div>
      </div>
    );
  }

  // Filter items by variant IDs
  const filteredItems = order.items.filter(item => 
    variantIdsToFilter.includes(item.variantId) || variantIdsToFilter.includes(item.productId)
  );

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-3">
        {/* Header */}
        <header className="card-header bg-primary text-white border-bottom border-primary-subtle p-4 rounded-top-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 className="mb-0 fw-bold fs-1">Order Details</h2>
            <span className="badge bg-light text-primary fs-6 px-3 py-2 shadow-sm">
              ID: {order.id}
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="card-body p-5">
          {/* General Info */}
          <section className="row g-4 mb-5">
            <div className="col-lg-6">
              <div className="card h-100 border border-primary-subtle shadow-sm">
                <div className="card-body">
                  <h3 className="card-title fw-semibold fs-4 mb-4 text-primary">Order Summary</h3>
                  <dl className="mb-0">
                    <div className="row mb-3">
                      <dt className="col-4 fw-medium text-primary">Status:</dt>
                      <dd className="col-8">
                        <span
                          className={`badge ${
                            order.status === 'pending' ? 'bg-warning text-dark' :
                            order.status === 'shipped' ? 'bg-info' :
                            order.status === 'completed' ? 'bg-success' :
                            order.status === 'canceled' ? 'bg-danger' : 'bg-secondary'
                          } fs-6 px-3 py-2`}
                        >
                          {order.status}
                        </span>
                      </dd>
                    </div>
                    <div className="row mb-3">
                      <dt className="col-4 fw-medium text-primary">Subtotal:</dt>
                      <dd className="col-8">PKR {order.subtotal.toFixed(2)}</dd>
                    </div>
                    <div className="row mb-3">
                      <dt className="col-4 fw-medium text-primary">Tax:</dt>
                      <dd className="col-8">PKR {order.tax.toFixed(2)}</dd>
                    </div>
                    <div className="row">
                      <dt className="col-4 fw-medium text-primary fs-5">Total:</dt>
                      <dd className="col-8 fw-bold fs-5 text-primary">PKR {order.total.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 border border-primary-subtle shadow-sm">
                <div className="card-body">
                  <h3 className="card-title fw-semibold fs-4 mb-4 text-primary">Timestamps</h3>
                  <dl className="mb-0">
                    <div className="row mb-3">
                      <dt className="col-4 fw-medium text-primary">Created At:</dt>
                      <dd className="col-8">{new Date(order.createdAt).toLocaleString()}</dd>
                    </div>
                    <div className="row">
                      <dt className="col-4 fw-medium text-primary">Updated At:</dt>
                      <dd className="col-8">{new Date(order.updatedAt).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Info */}
          <section className="mb-5">
            <h4 className="fw-semibold fs-3 mb-4 text-primary border-bottom pb-2">Customer</h4>
            <div className="card border border-primary-subtle shadow-sm">
              <div className="card-body">
                <dl className="mb-0">
                  <div className="row mb-3">
                    <dt className="col-4 fw-medium text-primary">Name:</dt>
                    <dd className="col-8">{order.customer.name || 'N/A'}</dd>
                  </div>
                  <div className="row mb-3">
                    <dt className="col-4 fw-medium text-primary">Email:</dt>
                    <dd className="col-8">
                      <a href={`mailto:${order.customer.email}`} className="text-primary text-decoration-underline">
                        {order.customer.email || 'N/A'}
                      </a>
                    </dd>
                  </div>
                  <div className="row">
                    <dt className="col-4 fw-medium text-primary">Phone:</dt>
                    <dd className="col-8">
                      <a href={`tel:${order.customer.phone}`} className="text-primary text-decoration-underline">
                        {order.customer.phone || 'N/A'}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="mb-5">
            <h4 className="fw-semibold fs-3 mb-4 text-primary border-bottom pb-2">
              Items (Filtered by Variant IDs: {variantIdsToFilter.join(', ')})
            </h4>
            <div className="card border border-primary-subtle shadow-sm">
              {filteredItems.length === 0 ? (
                <div className="card-body text-center py-4">
                  <p className="text-muted mb-0">No items match the variant ID filter.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {filteredItems.map((item) => {
                    const product = products?.find(p => p.id === item.productId);
                    // Assuming product has a variants array or variant info
                    const variant = product?.variants?.find(v => v.id === item.variantId) || 
                                  products?.find(p => p.id === item.variantId);
                    const variantName = variant?.name || variant?.title || `Variant ${item.variantId}`;
                    
                    return (
                      <li key={item.id} className="list-group-item px-4 py-3">
                        <div className="row">
                          <div className="col-12 col-md-8">
                            <span className="fw-medium text-primary">Product:</span>{' '}
                            {product ? product.name : `ID ${item.productId || 'N/A'} (Not Found)`}
                            {variant && (
                              <>
                                , <span className="fw-medium text-primary">Variant:</span>{' '}
                                {variantName} (ID: {item.variantId})
                              </>
                            )}
                          </div>
                          <div className="col-12 col-md-4">
                            <span className="fw-medium text-primary">Quantity:</span> {item.quantity},{' '}
                            <span className="fw-medium text-primary">Price:</span>{' '}
                            <span className="fw-bold text-success">PKR {item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Payments */}
          <section className="mb-5">
            <h4 className="fw-semibold fs-3 mb-4 text-primary border-bottom pb-2">Payments</h4>
            <div className="card border border-primary-subtle shadow-sm">
              <ul className="list-group list-group-flush">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="list-group-item px-4 py-3">
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <span className="fw-medium text-primary">Method:</span> {payment.method},{' '}
                        <span className="fw-medium text-primary">Status:</span>{' '}
                        <span
                          className={`badge ${
                            payment.status === 'pending' ? 'bg-warning text-dark' :
                            payment.status === 'completed' ? 'bg-success' : 'bg-secondary'
                          } fs-6 px-3 py-2`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="col-12 col-md-6">
                        <span className="fw-medium text-primary">Amount:</span>{' '}
                        <span className="fw-bold text-success">PKR {payment.amount.toFixed(2)}</span>,{' '}
                        <span className="fw-medium text-primary">Created At:</span>{' '}
                        {new Date(payment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h4 className="fw-semibold fs-3 mb-4 text-primary border-bottom pb-2">Shipping</h4>
            <div className="card border border-primary-subtle shadow-sm">
              <div className="card-body">
                <dl className="mb-0">
                  <div className="row mb-3">
                    <dt className="col-4 fw-medium text-primary">Carrier:</dt>
                    <dd className="col-8">{order.shipping.carrier || 'N/A'}</dd>
                  </div>
                  <div className="row mb-3">
                    <dt className="col-4 fw-medium text-primary">Address:</dt>
                    <dd className="col-8">{order.shipping.address || 'N/A'}</dd>
                  </div>
                  <div className="row">
                    <dt className="col-4 fw-medium text-primary">Location:</dt>
                    <dd className="col-8 bg-light p-2 rounded">
                      {[
                        order.shipping.city,
                        order.shipping.state,
                        order.shipping.zip,
                        order.shipping.country
                      ]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}