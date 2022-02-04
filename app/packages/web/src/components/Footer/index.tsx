import React from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row, Col } from 'antd';
import { footerConf } from './footerData';
import { LABELS } from '../../constants';
import DiscordIcon from '../svgs/discord';
import TwitterIcon from '../svgs/twitter';
import InstagramIcon from '../svgs/instagram';
import RedditIcon from '../svgs/reddit';
import YoutubeIcon from '../svgs/youtube';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const validateMessages = {
    types: {
      email: 'Input is not a valid email!',
    },
  };

  /* const CustomForm = (props: {
    status?: string;
    message?: string;
    onValidated?: (val: any) => void;
  }) => {
    let email: any;
    const submit = (values: any) => {
      email = values.user.email;
      email &&
        email.indexOf('@') > -1 &&
        props.onValidated &&
        props.onValidated({
          EMAIL: email,
          // NAME: name.value
        });
    };
    return (
      <>
        <Form onFinish={submit} validateMessages={validateMessages}>
          <Form.Item
            name={['user', 'email']}
            rules={[
              {
                type: 'email',
              },
            ]}
          >
            <Input type="text" placeholder="Email Address" bordered={false} />
            <Button htmlType="submit">
              <SendOutlined />
            </Button>
          </Form.Item>
        </Form>
        {props.status ? (
          <div>
            {props.status === 'sending' && <div>Loading...</div>}
            {props.status === 'error' && (
              <div dangerouslySetInnerHTML={{ __html: props.message ?? '' }} />
            )}
            {props.status === 'success' && (
              <div dangerouslySetInnerHTML={{ __html: props.message ?? '' }} />
            )}
          </div>
        ) : null}
      </>
    );
  };

  const NewsLetterForm = () => (
    // TODO: remove use of deprecated DOM API
    <CustomForm status={status} />
  );
 */
  return (
    <div className="footer_layout">
      <Row className='align-items-center'>
        <Col
          xs={24}
          sm={24}
          md={8}
          className='d-flex layout-left'
        >
          <h5>&copy; Queendom PBC, All rights reserved</h5>
        </Col>
        <Col md={8} className='desktop-show'>
          <Row justify="space-between" style={{maxWidth: '200px', margin: '0 auto'}}>
            <Col>
              <a href="https://twitter.com/Queendomverse">
                <TwitterIcon />
              </a>
            </Col>
            <Col>
              <a href="https://instagram.com">
                <InstagramIcon />
              </a>
            </Col>
            <Col>
              <a href="https://discord.gg/vYBcfGSdYr">
                <DiscordIcon />
              </a>
            </Col>
            <Col>
              <a href="https://www.reddit.com/r/queendomverse">
                <RedditIcon />
              </a>
            </Col>
            <Col>
              <a href="https://www.youtube.com">
                <YoutubeIcon />
              </a>
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={8} className='d-flex layout-right'>
          <a href="" className="me-4">
            <h5 className="fw-bold">Terms</h5>
          </a>
          <a href="">
            <h5 className="fw-bold">Privacy Policy</h5>
          </a>
        </Col>
      </Row>
    </div>
  );
};
