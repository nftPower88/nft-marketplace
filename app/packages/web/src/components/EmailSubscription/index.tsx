import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row, Col } from 'antd';
import { footerConf } from './footerData';
import { LABELS } from '../../constants';
import { useTheme, Theme } from '../../contexts/themecontext';

export const EmailSubscription = () => {
  const { theme, setTheme } = useTheme();
  const validateMessages = {
    types: {
      email: 'Input is not a valid email!',
    },
  };

  const CustomForm = (props: {
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
      <div className="mb-2">
        <h4 className="text-center fw-bold">Get the latest Queendom Updates</h4>
        <Form onFinish={submit} validateMessages={validateMessages}>
          <Row justify="center" align="middle">
            <Col
              span={16}
              className="align-items-center"
              style={{ height: 'auto' }}
            >
              <Input
                required
                type="email"
                placeholder="Subscribe to our newsletter"
                bordered={false}
                className={theme === Theme.Light ? 'inputWhite' : 'inputBlack'}
              />
            </Col>
            <Col span={1}>
              <Button htmlType="submit" type="primary">
                Subscribe
              </Button>
            </Col>
          </Row>
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
      </div>
    );
  };

  const NewsLetterForm = () => (
    // TODO: remove use of deprecated DOM API
    <CustomForm status={status} />
  );

  return <NewsLetterForm />;
};
