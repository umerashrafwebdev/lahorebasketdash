import Footer from '@/components/layout/Footer';
import React from 'react';
// import Chart from './components/Chart'; // Commented out as per your code
// import User from './components/User';
import Link from 'next/link';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Col, Row } from 'react-bootstrap';
// import Cards from './components/Cards'; // Commented out
import DashboardStats from './DashboardStats';

export const metadata = {
  title: 'Analytics',
};

const Page = async () => {
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://api.g3studio.co/api/orders', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', // Ensure fresh data
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw API Response:', JSON.stringify(data, null, 2));
      const ordersArray = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
      console.log('Processed Orders:', JSON.stringify(ordersArray.slice(0, 5), null, 2));
      console.log('Total Orders Fetched:', ordersArray.length);
      return ordersArray;
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      return [];
    }
  };

  const orders = await fetchOrders();

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="mb-0">Dashboard</h4>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Taplox</Link>
              </li>
              <div className="mx-1" style={{ height: 24, paddingRight: '8px' }}>
                <IconifyIcon icon="bx:chevron-right" height={16} width={16} />
              </div>
              <li className="breadcrumb-item active">Dashboard</li>
            </ol>
          </div>
        </Col>
      </Row>
      <DashboardStats orders={orders} />
      {/* <Cards /> */}
      {/* <Chart /> */}
      {/* <User /> */}
      <Footer />
    </>
  );
};

export default Page;