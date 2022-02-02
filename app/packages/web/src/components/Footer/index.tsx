import React from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row, Col, Divider } from 'antd';
import { footerConf } from './footerData';
import { LABELS } from '../../constants';
import DiscordIcon from '../svgs/discord';
import TwitterIcon from '../svgs/twitter';
import InstagramIcon from '../svgs/instagram';
import RedditIcon from '../svgs/reddit';
import YoutubeIcon from '../svgs/youtube';
import { SocialIcon } from './social_icon';
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
    <div>
      <div className="d-sm-none d-flex m-auto justify-content-center">
        <h5>&copy; Queendom PBC, All rights reserved</h5>
      </div>
      <div className="footer_layout position-relative d-flex justify-content-between">
        <h5 className="float-left d-sm-flex d-none">
          &copy; Queendom PBC, All rights reserved
        </h5>

        <div className="position-absolute translate-middle top-50 start-50 d-none d-sm-flex">
          <SocialIcon />
        </div>

        <div className="sm-position-absolute end-0 d-sm-flex d-none text-center">
          <a href="" className="me-3">
            <h5 className="fw-bold">Terms</h5>
          </a>
          <a href="">
            <h5 className="fw-bold">Privacy Policy</h5>
          </a>
        </div>
        <div className="d-sm-none d-flex m-auto justify-content-center">
          <a href="" className="me-3">
            <h5 className="fw-bold">Terms</h5>
          </a>
          <a href="">
            <h5 className="fw-bold">Privacy Policy</h5>
          </a>
        </div>
      </div>
    </div>
  );
};
