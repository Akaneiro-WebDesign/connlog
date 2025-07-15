import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title:'Connlog',
  description:'connpassイベント×スキルの記録',
};

export default function RootLayout ({
  children,
}:{
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
        <body>
          <ClientLayout>
                {children}
          </ClientLayout>
          </body>
    </html>
  );
}