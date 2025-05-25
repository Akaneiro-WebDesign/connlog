import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SupabaseProvider from '@/components/SupabaseProvider';

const geistSans = Geist ({
  subsets :['latin'],
  variable :'--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets:['latin'],
  variable:'--font-geist-mono'
});

export const metadata: Metadata = {
  title:'ConnLog',
  description: 'connpass参加履歴を可視化するアプリ',
};
export default function RootLayout ({
  children,
}:{
  children:React.ReactNode;
}) {
  return (
    <html lang="ja">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <SupabaseProvider>
                {children}
            </SupabaseProvider>
          </body>
    </html>
  );
}