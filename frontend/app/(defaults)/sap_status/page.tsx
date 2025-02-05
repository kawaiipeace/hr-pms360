import { Metadata } from 'next';
import React from 'react';
import TransactionDaily from '@/components/transaction_daily';
import { ContextMenuProvider } from 'mantine-contextmenu';

export const metadata: Metadata = {
    title: 'สถานะส่งขึ้น SAP',
};

const Incoming = () => {
    return (
        <>
            <ContextMenuProvider>
                <div className="prose bg-[#f1f2f3] px-4 py-9 sm:px-8 sm:py-16 rounded max-w-full dark:bg-[#1b2e4b] dark:text-white-light w-full mb-5">
                    <h2 className="text-dark mb-5  mt-4 text-center text-5xl dark:text-white-light">หน้าตรวจสอบสถานะส่งขึ้น SAP</h2>
                    <p className="lead mt-3 mb-4 dark:text-white-light">
                        กำลังจะเริ่มทำสิ่งที่น่าสนใจ เร็ว ๆ นี้...
                    </p>
                </div>
            </ContextMenuProvider>
        </>
    );
};

export default Incoming;
