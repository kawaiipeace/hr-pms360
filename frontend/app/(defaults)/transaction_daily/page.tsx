import { Metadata } from 'next';
import React from 'react';
import { ContextMenuProvider } from 'mantine-contextmenu';

export const metadata: Metadata = {
    title: 'ข้อมูลธุรกรรมรายวัน',
};

const Incoming = () => {
    return (
        <>
            <ContextMenuProvider>
                <div className="prose bg-[#f1f2f3] px-4 py-9 sm:px-8 sm:py-16 rounded max-w-full dark:bg-[#1b2e4b] dark:text-white-light w-full mb-5">
                    <h2 className="text-dark mb-5  mt-4 text-center text-5xl dark:text-white-light">หน้าจัดการบัตรเติมน้ำมัน</h2>
                    <p className="lead mt-3 mb-4 dark:text-white-light">
                        กำลังจะเริ่มทำสิ่งที่น่าสนใจ เร็ว ๆ นี้...
                    </p>
                </div>
            </ContextMenuProvider>
        </>
    );
};

export default Incoming;
