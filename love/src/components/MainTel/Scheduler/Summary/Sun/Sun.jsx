import React, { Component } from 'react';
import styles from './Sun.module.css';
import SummaryPanel from 'components/GeneralPurpose/SummaryPanel/SummaryPanel';
import Label from '../../../../GeneralPurpose/SummaryPanel/Label';
import Value from '../../../../GeneralPurpose/SummaryPanel/Value';
import Title from '../../../../GeneralPurpose/SummaryPanel/Title';

export default class Sun extends Component {

    render() {
        return (
            <div className={styles.container}>
                <SummaryPanel className={styles.summaryPanel}>
                        <Title>Sun</Title>
                        <span></span>
                </SummaryPanel>
                <div className={styles.divContainer}>
                    <SummaryPanel className={styles.summaryPanel}>
                        <Label>Altitude</Label>
                        <Value>-23.24°</Value>
                        <Label>Azimuth</Label>
                        <Value>64.13°</Value>
                        <Label>Ra</Label>
                        <Value>08h 42m 02s</Value>
                        <Label>Dec</Label>
                        <Value>-21° 17' 29"</Value>
                        <Label>Elongation</Label>
                        <Value>24.00°</Value>
                    </SummaryPanel>
                    <div className={styles.div3}>
                        <span>Sun cartoon</span>
                    </div>
                </div>
            </div>
        );
    };
}