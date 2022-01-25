import React, { useEffect } from 'react';
import { Button, Card, Row, Col, Layout } from 'antd';
import { MetaplexOverlay } from '@oyster/common';
import { Link } from 'react-router-dom';
export const SignInView = () => {
  return (
    <MetaplexOverlay visible centered closable>
      <Layout>
        <Row justify="center">
          <Col span={24}>
              <Link to='/'>Back</Link>
          </Col>
        </Row>
      </Layout>
    </MetaplexOverlay>
  );
};
