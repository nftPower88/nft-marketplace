// @ts-nocheck

import {
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Col, Row, Spin, Tabs, Card, Badge, Divider, Switch, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export const SettingView = () => {
    const { connected, publicKey } = useWallet();
    const history = useHistory();
  
    !connected && history.push('/')
    
    return (
        <div className='setting-container'>
            <h2>Settings</h2>
            <Divider />
            <h3>Email Notification</h3>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>Transaction-based notifications</span>
                <QuestionCircleOutlined className='questionIcon'/>
            </div>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>New follower notifications</span>
            </div>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>New artwork notifications</span>
            </div>
            <Divider />
            <h3>App Notification</h3>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>New follower notifications</span>
            </div>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>New artwork notifications</span>
            </div>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>New likes notifications</span>
            </div>
            <Divider />
            <h3>Activity Feed</h3>
            <div className='swichContainer'>
                <Switch defaultChecked className='switch'/>
                <span className='switchSpan'>Noise Filter</span>
                <QuestionCircleOutlined className='questionIcon'/>
            </div>
            <Divider />
            <h3>Minimum Bid</h3>
            <div className='swichContainer'>
                <span className='switchSpan'>Require incoming bids to be at least </span>
                <InputNumber defaultValue={0} min={0} className='inputNumber'/>
                <span className='switchSpan'>ETH </span>
                <QuestionCircleOutlined className='questionIcon'/>
            </div>
            <Divider />
            <h3>Transaction History</h3>
            <div className='swichContainer'>
                <a className='download' href='#'>Download transaction history</a>
            </div>
            <Divider />
            <div className='save-button-container'>
                <Button className='saveButton'>Save</Button>
            </div>
        </div>
    );
};
