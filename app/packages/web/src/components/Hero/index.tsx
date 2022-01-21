/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Popover,
  Spin,
  Button,
  Carousel,
  Col,
  List,
  Row,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import Link from 'next/link';

const Hero = function () {
  const { Title } = Typography;
  return (
    <div className="hero_element">
      <h1 className="hero_title">
        Enter the <br /> Metaverse
      </h1>
      <h3 className="hero_subtitle">
        Real-Time 3D Streaming for Limitless Experiences
      </h3>
      <div style={{ display: 'flex',justifyContent:'center' }}>
        <Button type="primary"><Link href="http://queendom.io/#/client">Connect With Us</Link></Button>
        <span style={{'width':'2rem'}}/>
        <Button >Watch Video</Button>
      </div>
    </div>
  );
};

export default Hero;
