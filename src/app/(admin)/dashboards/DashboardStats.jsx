'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Button } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardStats = ({ orders = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [trafficData, setTrafficData] = useState(null);

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const safeOrders = Array.isArray(orders) ? orders : [];
  console.log('Orders Received in DashboardStats:', safeOrders.length);
  console.log('Sample Orders:', JSON.stringify(safeOrders.slice(0, 5), null, 2));

  // Core Filters
  const ordersToday = safeOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    );
  });

  const totalRevenueToday = ordersToday.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingOrdersToday = ordersToday.filter((order) => order.status === 'pending').length;
  const completedOrdersToday = ordersToday.filter((order) => order.status === 'completed').length;
  const shippedOrdersToday = ordersToday.filter((order) => order.status === 'shipped').length;
  const canceledOrdersToday = ordersToday.filter((order) => order.status === 'canceled').length;

  const ordersLast30Days = safeOrders.filter((order) => new Date(order.createdAt) >= thirtyDaysAgo);
  const totalSalesLast30Days = ordersLast30Days.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  // New All-Time Metrics
  const totalOrders = safeOrders.length;
  const totalPendingOrders = safeOrders.filter((order) => order.status === 'pending').length;
  const totalCustomers = new Set(safeOrders.map((order) => order.customerId || order.customer?.id)).size;
  const canceledOrders = safeOrders.filter((order) => order.status === 'canceled').length;

  // Latest 5 Orders and Customers
  const latestOrders = safeOrders.slice(-5).reverse();
  const latestCustomers = [...new Set(safeOrders.slice(-5).reverse().map((order) => order.customerId || order.customer?.id))];

  // Mock Google Analytics Traffic Data
  useEffect(() => {
    const mockTrafficData = {
      sessionsBySource: {
        'Organic Search': 1200,
        'Direct': 800,
        'Referral': 500,
        'Social': 300,
      },
    };
    setTrafficData(mockTrafficData);
  }, []);

  // Graph 1: Line Chart (Pending Orders & Sales)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toLocaleDateString();
  }).reverse();

  const pendingOrdersByDay = last30Days.map((date) =>
    safeOrders.filter((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      return orderDate === date && order.status === 'pending';
    }).length
  );

  const salesByDay = last30Days.map((date) =>
    safeOrders
      .filter((order) => new Date(order.createdAt).toLocaleDateString() === date)
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  );

  const lineChartData = {
    labels: last30Days,
    datasets: [
      {
        label: 'Pending Orders',
        data: pendingOrdersByDay,
        borderColor: '#637381',
        backgroundColor: 'rgba(99, 115, 129, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#637381',
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Sales (PKR)',
        data: salesByDay,
        borderColor: '#006fbb',
        backgroundColor: 'rgba(0, 111, 187, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#006fbb',
        pointRadius: 0,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#dfe3e8' }, ticks: { color: '#637381' } },
      y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#637381' } },
      x: { grid: { display: false }, ticks: { color: '#637381' } },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#637381', font: { size: 12 } } },
      title: { display: true, text: 'Sales and Pending Orders', color: '#212529', font: { size: 16, weight: '500' } },
      tooltip: { backgroundColor: '#212529', titleColor: '#fff', bodyColor: '#fff' },
    },
  };

  // Graph 2: Bar Chart (Orders by Status Today)
  const barChartData = {
    labels: ['Pending', 'Completed', 'Shipped', 'Canceled'],
    datasets: [{
      label: 'Orders Today',
      data: [pendingOrdersToday, completedOrdersToday, shippedOrdersToday, canceledOrdersToday],
      backgroundColor: ['#637381', '#006fbb', '#2ecc71', '#e74c3c'],
      borderWidth: 0,
    }],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#dfe3e8' }, ticks: { color: '#637381' } },
      x: { grid: { display: false }, ticks: { color: '#637381' } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Orders by Status Today', color: '#212529', font: { size: 16, weight: '500' } },
    },
  };

  // Graph 3: Pie Chart (Traffic Sources)
  const pieChartData = trafficData ? {
    labels: Object.keys(trafficData.sessionsBySource),
    datasets: [{
      data: Object.values(trafficData.sessionsBySource),
      backgroundColor: ['#006fbb', '#637381', '#2ecc71', '#ffcd56'],
      borderColor: '#fff',
      borderWidth: 1,
    }],
  } : { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#dfe3e8'], borderWidth: 0 }] };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { color: '#637381', font: { size: 12 } } },
      title: { display: true, text: 'Traffic Sources', color: '#212529', font: { size: 16, weight: '500' } },
    },
  };

  // Graph 4: Area Chart (Sales Trend)
  const areaChartData = {
    labels: last30Days,
    datasets: [{
      label: 'Sales (PKR)',
      data: salesByDay,
      backgroundColor: 'rgba(0, 111, 187, 0.2)',
      borderColor: '#006fbb',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
    }],
  };

  const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#dfe3e8' }, ticks: { color: '#637381' } },
      x: { grid: { display: false }, ticks: { color: '#637381' } },
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#637381', font: { size: 12 } } },
      title: { display: true, text: 'Sales Trend', color: '#212529', font: { size: 16, weight: '500' } },
    },
  };

  return (
    <>
      <Row className="mb-4 g-3">
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Total Orders</h6>
              <h3 className="shopify-value text-dark">{totalOrders}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Total Pending Orders</h6>
              <h3 className="shopify-value text-dark">{totalPendingOrders}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Total Customers</h6>
              <h3 className="shopify-value text-dark">{totalCustomers}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Canceled Orders</h6>
              <h3 className="shopify-value text-dark">{canceledOrders}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Orders Today</h6>
              <h3 className="shopify-value text-dark">{ordersToday.length}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Total Revenue Today</h6>
              <h3 className="shopify-value text-success">PKR {totalRevenueToday.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Orders Last 30 Days</h6>
              <h3 className="shopify-value text-dark">{ordersLast30Days.length}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shopify-card border-light bg-light-subtle">
            <CardBody>
              <h6 className="text-muted mb-2 shopify-subtext">Total Sales (Last 30 Days)</h6>
              <h3 className="shopify-value text-dark">PKR {totalSalesLast30Days.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card className="shopify-card border-light">
            <CardBody style={{ height: '350px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12} className="text-center">
          <Button
            variant="outline-primary"
            className="shopify-button fw-medium"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Details' : 'Show More Insights'}
          </Button>
        </Col>
      </Row>

      {expanded && (
        <>
          <Row className="mt-4 g-3">
            <Col md={6}>
              <Card className="shopify-card border-light">
                <CardBody style={{ height: '300px' }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shopify-card border-light">
                <CardBody style={{ height: '300px' }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xs={12}>
              <Card className="shopify-card border-light">
                <CardBody style={{ height: '350px' }}>
                  <Line data={areaChartData} options={areaChartOptions} />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4 g-3">
            <Col md={6}>
              <Card className="shopify-card border-light">
                <CardBody>
                  <h5 className="shopify-title mb-3">Latest 5 Orders</h5>
                  <ul className="list-unstyled">
                    {latestOrders.map((order, index) => (
                      <li key={index} className="shopify-list-item mb-2 p-2">
                        Order #{order.id || index} - <span className="fw-medium">PKR {(Number(order.total) || 0).toFixed(2)}</span> ({order.status})
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shopify-card border-light">
                <CardBody>
                  <h5 className="shopify-title mb-3">Latest 5 Customers</h5>
                  <ul className="list-unstyled">
                    {latestCustomers.map((customerId, index) => (
                      <li key={index} className="shopify-list-item mb-2 p-2">
                        {customerId || `Customer ${index + 1}`}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Shopify-like Custom CSS */}
      <style jsx>{`
        .shopify-card {
          background-color: #fff;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          transition: box-shadow 0.2s ease;
        }
        .shopify-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .shopify-value {
          font-size: 1.75rem;
          font-weight: 500;
          color: #212529;
        }
        .shopify-subtext {
          font-size: 0.875rem;
          font-weight: 400;
          color: #637381;
          text-transform: uppercase;
        }
        .shopify-button {
          border-color: #006fbb;
          color: #006fbb;
          font-size: 0.9rem;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .shopify-button:hover {
          background-color: #006fbb;
          color: #fff;
          border-color: #006fbb;
        }
        .shopify-title {
          font-size: 1.25rem;
          font-weight: 500;
          color: #212529;
        }
        .shopify-list-item {
          font-size: 0.95rem;
          color: #637381;
          background-color: #f4f6f8;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .shopify-list-item:hover {
          background-color: #e9ecef;
        }
      `}</style>
    </>
  );
};

export default DashboardStats;