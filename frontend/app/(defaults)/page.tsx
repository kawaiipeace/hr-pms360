import { Metadata } from 'next';
import React from 'react';
import Dashboard from '@/components/dashboard';

export const metadata: Metadata = {
    title: 'หน้าหลัก',
};

const Dashboard_main = () => {
    return <Dashboard />;
};

export default Dashboard_main;
