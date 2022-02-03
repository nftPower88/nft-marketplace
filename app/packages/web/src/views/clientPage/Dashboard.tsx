import React, { useEffect } from 'react';
import { DownloadOutlined, UploadOutlined, InfoCircleFilled, MenuOutlined } from '@ant-design/icons';
// import { Provider } from "react-redux"
// import * as webRTCHandler from "../../utils/webRTC/webRTCHandler";
import { Button, Col, Row, Spin, Card, Tabs } from 'antd';
// import ActiveUsersList from "../../components/ActiverUsersList/ActiveUsersList";
// import DirectCall from "../../components/DirectCall/DirectCall";
// import { store } from "../../store/store";
// import PixelStreamer from "../../components/PixelStreamer";
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';
import {useSignIn} from '../../hooks'

const { TabPane } = Tabs;

export const DashboardView = () => {
  // useEffect(() => {
  // //  webRTCHandler.getLocalStream();
  //   webRTCHandler.getRemoteStream();
  // }, []);

  const { connected, publicKey } = useWallet();
  const { signInConfirm } = useSignIn();
  const history = useHistory();

  !signInConfirm(publicKey?.toBase58()) && history.push('/')

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
    <div className='dashboard'>
      <div className='flexBetween'>
        <div className='leftValue'>
          0.026<MenuOutlined />
          <span className='smallFont'>$68</span>
        </div>
        <div className='btnContainer'>
          <div className='btnWithSpan'>
            <Button className='roundButton'>
              <DownloadOutlined />
            </Button>
            <span className='btnSpan'>RECEIVE</span>
          </div>
          <div className='btnWithSpan'>
            <Button className='roundButton'>
              <UploadOutlined />
            </Button>
            <span className='btnSpan'>SEND</span>
          </div>
        </div>
      </div>

      <div className='flexBetween'>
        <div className='leftValue'>0$RARE</div>
        <div className='btnContainer'>
          <div className='btnWithSpan'>
            <Button className='roundButton'>
              <DownloadOutlined />
            </Button>
            <span className='btnSpan'>RECEIVE</span>
          </div>
          <div className='btnWithSpan'>
            <Button className='roundButton'>
              <UploadOutlined />
            </Button>
            <span className='btnSpan'>SEND</span>
          </div>
        </div>
      </div>

      <Row>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>TOTAL VALUES</span>
              <span className='cardValue'>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>TOTAL SALES VALUES</span>
              <span className='cardValue'>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>ARTISTS COLLECTED</span>
              <span className='cardValue'>0</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>TOTAL # COLLECTED</span>
              <span className='cardValue'>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>TOTAL COLLECTED VALUE</span>
              <span className='cardValue'>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card'>
            <div className='flexRow'>
              <span className='cardTitle'>...</span>
              <span className='cardValue'>0 ETH</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable={true} className='card' bodyStyle={{width: '100%'}}>
            <div className='flexRow'>
              <span className='cardTitle'>...<InfoCircleFilled className='infoIcon'/></span>
              <div className='cardButtonContainer'>
                <span className='cardValue'>0 ETH</span>
                <Button className='claimButton'>Claim</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className='offerContainer'>
        <p className='offerTitle'>Offers</p>
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="INCOMING" key="1">
            <div className='noMessage'>No active offers</div>
          </TabPane>
          <TabPane tab="OUTCOMING" key="2">
            <div className='noMessage'>No active offers</div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
