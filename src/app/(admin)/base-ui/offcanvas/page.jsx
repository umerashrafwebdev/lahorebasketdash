import AllOffcanvas from './components/AllOffcanvas';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Offcanvas'
};
const Offcanvas = () => {
  return <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="mb-0">Offcanvas</h4>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="">Base UI</Link>
              </li>
              <div className="mx-1" style={{
              height: 24
            }}>
                <IconifyIcon icon="bx:chevron-right" height={16} width={16} />
              </div>
              <li className="breadcrumb-item active">Offcanvas</li>
            </ol>
          </div>
        </Col>
      </Row>
      <Row>
        <AllOffcanvas />
      </Row>
    </>;
};
export default Offcanvas;