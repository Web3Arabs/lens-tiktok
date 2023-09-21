// app/layout.tsx
"use client";
import './globals.css';
import { LivepeerConfig, createReactClient, studioProvider } from '@livepeer/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { LensConfig, LensProvider, development, production, appId } from '@lens-protocol/react-web';
import { bindings as wagmiBindings } from '@lens-protocol/wagmi';

// Polygon تهيئة الشبكة التي ستقوم المحفظة بالإتصال بها وهي شبكة
const { publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, polygon],
  [publicProvider()],
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({
      options: {
        shimDisconnect: false, // see https://github.com/wagmi-dev/wagmi/issues/2511
      },
    }),
  ],
});

// إعداد البروتوكول في المشروع
const lensConfig: LensConfig = {
  // إضافة إسم للتطبيق
  appId: appId('TikTok'),
  // يقوم بتوفير الربط والتوقيع مع الحساب
  bindings: wagmiBindings(),
  // تحديد البيئة التي سيتعامل معها المشروع
  // production وإذا كان حساب اساسي اجعلها development إذا كان على حساب تجريبي قم بإستخدام
  // development واثناء تجربة النشر سنجعلها production اثناء استدعاء المنشورات سنجعلها
  environment: development,
};
 
// Livepeer إعداد المشروع مع
const LivePeerClient = createReactClient({
  // بالمفتاح الخاص بك الذي قمنا بإنشائه add-livepeer-api-key قم بتغيير
  provider: studioProvider({ apiKey: "add-livepeer-api-key" }),
});

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={config}>
          <LensProvider config={lensConfig}>
            <LivepeerConfig client={LivePeerClient}>
              {children}
            </LivepeerConfig>
          </LensProvider>
        </WagmiConfig>
      </body>
    </html>
  );
};
