import React, { useEffect } from 'react';
import { DownloadOutlined, UploadOutlined, InfoCircleFilled, MenuOutlined } from '@ant-design/icons';
// import { Provider } from "react-redux"
// import * as webRTCHandler from "../../utils/webRTC/webRTCHandler";
import styles from './Dashboard.module.css';
import { Button, Col, Row, Spin, Card, Tabs } from 'antd';
// import ActiveUsersList from "../../components/ActiverUsersList/ActiveUsersList";
// import DirectCall from "../../components/DirectCall/DirectCall";
// import { store } from "../../store/store";
// import PixelStreamer from "../../components/PixelStreamer";

const { TabPane } = Tabs;

export const DashboardView = () => {
  // useEffect(() => {
  // //  webRTCHandler.getLocalStream();
  //   webRTCHandler.getRemoteStream();
  // }, []);

  return (
    // <Provider store={store}>
    //   <div className="dashboard_container background_main_color">
    //     <div className="dashboard_left_section">
    //       <div className="dashboard_content_container">
    //           {/* <DirectCall />*/}
    //           <PixelStreamer />
    //       </div>
    //       <div className="dashboard_rooms_container background_secondary_color">
    //       </div>
    //     </div>
    //     <div className="dashboard_right_section background_secondary_color">
    //       <div className="dashboard_active_users_list">
    //         <ActiveUsersList />
    //       </div>
    //     </div>
    //   </div>
    // </Provider>
    <div className={styles.dashboard}>
      <div className={styles.flexBetween}>
        <div className={styles.leftValue}>
          0.026<MenuOutlined />
          <span className={styles.smallFont}>$68</span>
        </div>
        <div className={styles.btnContainer}>
          <div className={styles.btnWithSpan}>
            <Button className={styles.roundButton}>
              <DownloadOutlined />
            </Button>
            <span className={styles.btnSpan}>RECEIVE</span>
          </div>
          <div className={styles.btnWithSpan}>
            <Button className={styles.roundButton}>
              <UploadOutlined />
            </Button>
            <span className={styles.btnSpan}>SEND</span>
          </div>
        </div>
      </div>

      <div className={styles.flexBetween}>
        <div className={styles.leftValue}>0$RARE</div>
        <div className={styles.btnContainer}>
          <div className={styles.btnWithSpan}>
            <Button className={styles.roundButton}>
              <DownloadOutlined />
            </Button>
            <span className={styles.btnSpan}>RECEIVE</span>
          </div>
          <div className={styles.btnWithSpan}>
            <Button className={styles.roundButton}>
              <UploadOutlined />
            </Button>
            <span className={styles.btnSpan}>SEND</span>
          </div>
        </div>
      </div>

      <Row>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>TOTAL VALUES</span>
              <span className={styles.cardValue}>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>TOTAL SALES VALUES</span>
              <span className={styles.cardValue}>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>ARTISTS COLLECTED</span>
              <span className={styles.cardValue}>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>TOTAL # COLLECTED</span>
              <span className={styles.cardValue}>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>TOTAL COLLECTED VALUE</span>
              <span className={styles.cardValue}>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>...</span>
              <span className={styles.cardValue}>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className={styles.card} bodyStyle={{width: '100%'}}>
            <div className={styles.flexRow}>
              <span className={styles.cardTitle}>...<InfoCircleFilled className={styles.infoIcon}/></span>
              <div className={styles.cardButtonContainer}>
                <span className={styles.cardValue}>0 ETH</span>
                <Button className={styles.claimButton}>Claim</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className={styles.offerContainer}>
        <p className={styles.offerTitle}>Offers</p>
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="INCOMING" key="1">
            <div className={styles.noMessage}>No active offers</div>
          </TabPane>
          <TabPane tab="OUTCOMING" key="2">
            <div className={styles.noMessage}>No active offers</div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
