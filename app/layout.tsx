import type { Metadata } from 'next';
import './globals.css';

import { App, ConfigProvider } from 'antd';

import GlobalThemeConfig from '@/configs/theme.global.json';
import { getAccessToken } from '@/utils/helpers';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Bible Discipleship System',
  description: 'Bible Discipleship Tree Management System',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessToken = await getAccessToken();

  return (
    <html lang="en">
      <body>
        <ConfigProvider
          theme={GlobalThemeConfig}
          notification={{ style: { top: '80px' } }}
          form={{
            validateMessages: {
              required: 'This field is required!',
            },
          }}
        >
          <App>
            {accessToken ? (
              <AppLayout>{children}</AppLayout>
            ) : (
              children
            )}
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}