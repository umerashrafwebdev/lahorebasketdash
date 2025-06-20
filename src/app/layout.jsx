import '@/assets/scss/style.scss';
import './globals.css'
import AppProvidersWrapper from '@/components/wrapper/AppProvidersWrapper';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import { Roboto } from 'next/font/google';
const roboto = Roboto({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900']
});
export const metadata = {
  title: {
    template: '%s | Taplox - Responsive Admin Dashboard Template',
    default: DEFAULT_PAGE_TITLE
  },
  description: 'Generated by create next app'
};
export default function RootLayout({
  children
}) {
  return <html lang="en">
      <head></head>
      <body className={roboto.className}>
        <div id="__next_splash">
          <AppProvidersWrapper>{children}</AppProvidersWrapper>
        </div>
      </body>
    </html>;
}