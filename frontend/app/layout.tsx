import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';

export const metadata: Metadata = {
    title: {
        template: '%s | ระบบจัดการบัตรเติมน้ำมัน (VMS-FCMS)',
        default: 'ระบบจัดการบัตรเติมน้ำมัน (VMS-FCMS)',
    },
};
const noto = Noto_Sans_Thai({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['thai'],
    display: 'swap',
    variable: '--font-Noto_Sans_Thai',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="th">
            <body className={noto.variable}>
                <ProviderComponent>{children}</ProviderComponent>
            </body>
        </html>
    );
}
