import { Metadata } from 'next';
import React from 'react';
import TransactionDaily from '@/components/transaction_daily';
import { ContextMenuProvider } from 'mantine-contextmenu';

export const metadata: Metadata = {
    title: 'ข้อมูลธุรกรรมรายวัน',
};

const Incoming = () => {
    return (
        <>
            <ContextMenuProvider>
                <TransactionDaily />
            </ContextMenuProvider>
        </>
    );
};

export default Incoming;
