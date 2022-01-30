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
    <div className="footer_layout position-relative">
      <Row justify="space-between" align="bottom">
        <Col
          xs={8}
          sm={7}
          className="d-flex justify-content-center align-items-center"
        >
          <h5>&copy; Queendom, All rights reserved</h5>
        </Col>
        <div className="position-absolute translate-middle top-50 start-50">
          <Row justify="space-between" style={{ width: '200px' }}>
            <Col>
              <TwitterIcon />
            </Col>
            <Col>
              <InstagramIcon />
            </Col>
            <Col>
              <DiscordIcon />
            </Col>
            <Col>
              <RedditIcon />
            </Col>
            <Col>
              <YoutubeIcon />
            </Col>
          </Row>
        </div>
        <Col
          push={5}
          xs={1}
          sm={2}
          className="d-flex justify-content-end align-items-center"
        >
          <h5>
            <strong>Terms</strong>
          </h5>
        </Col>
        <Col
          span={3}
          className="d-flex justify-content-center align-items-center"
        >
          <h5>
            <strong>Privacy Policy</strong>
          </h5>
        </Col>
      </Row>
    </div>
  );
};
