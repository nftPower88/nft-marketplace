import {
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Col, Row, Spin, Tabs, Card, Badge, Divider, Switch, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {useSignIn} from '../../hooks'
import styles from './style.module.css';

export const SettingView = () => {
    const { connected, publicKey } = useWallet();
    const { signInConfirm } = useSignIn();
    const history = useHistory();
  
    !signInConfirm(publicKey?.toBase58()) && history.push('/')
    
    return (
        <div className={styles.setting}>
            <h2>Settings</h2>
            <Divider />
            <h3>Email Notification</h3>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>Transaction-based notifications</span>
                <QuestionCircleOutlined className={styles.questionIcon}/>
            </div>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>New follower notifications</span>
            </div>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>New artwork notifications</span>
            </div>
            <Divider />
            <h3>App Notification</h3>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>New follower notifications</span>
            </div>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>New artwork notifications</span>
            </div>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>New likes notifications</span>
            </div>
            <Divider />
            <h3>Activity Feed</h3>
            <div className={styles.swichContainer}>
                <Switch defaultChecked className={styles.switch}/>
                <span className={styles.switchSpan}>Noise Filter</span>
                <QuestionCircleOutlined className={styles.questionIcon}/>
            </div>
            <Divider />
            <h3>Minimum Bid</h3>
            <div className={styles.swichContainer}>
                <span className={styles.switchSpan}>Require incoming bids to be at least </span>
                <InputNumber defaultValue={0} min={0} className={styles.inputNumber}/>
                <span className={styles.switchSpan}>ETH </span>
                <QuestionCircleOutlined className={styles.questionIcon}/>
            </div>
            <Divider />
            <h3>Transaction History</h3>
            <div className={styles.swichContainer}>
                <a className={styles.download} href='#'>Download transaction history</a>
            </div>
            <Divider />
            <Button className={styles.saveButton}>Save</Button>
        </div>
    );
};
