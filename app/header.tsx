// app/header.tsx
import { useWalletLogin, useWalletLogout, useActiveProfile } from '@lens-protocol/react-web';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function Header() {
  // ربط المحفظة بالموقع
  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });

  // إستدعاء المحفظة المرتبطة بالموقع
  const { isConnected } = useAccount();
  // فصل المحفظة عن الموقع
  const { disconnectAsync } = useDisconnect();

  // تسجيل الدخول وإستدعاء الحساب من البروتوكول المرتبط بالمحفظة
  const { execute: login, isPending: isLoginPending } = useWalletLogin();
  // Lens تسجيل الخروج من حساب بروتوكول
  const { execute: logout, isPending: isLogoutPending } = useWalletLogout();

  // إستدعاء بيانات الحساب الذي في حالة تسجيل دخول
  const { data: profile, loading: isLoading } = useActiveProfile();

  // Lens تعمل الدالة على عملية ربط المحفظة وتسجيل الدخول عبر حساب
  const onLoginClick = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    const { connector } = await connectAsync();

    if (connector instanceof InjectedConnector) {
      const walletClient = await connector.getWalletClient();
      await login({
        address: walletClient.account.address,
      });
    }
  };
  
  return (
    <nav className="relative z-20 w-full md:static md:text-sm md:border-none -mt-6 mb-3">
      <div className="items-center gap-x-14 px-4 max-w-screen-xl mx-auto md:flex md:px-8">
        <div className="flex items-center justify-between py-3 md:py-5 md:block">
          <a href="/">
            <img className="bg-white rounded-full" width="50" height="50" src="https://seeklogo.com/images/T/tiktok-share-icon-black-logo-29FFD062A0-seeklogo.com.png"/>
          </a>
        </div>
        <div className="w-[55%] flex justify-center items-center">
          <input
            type="text"
            placeholder="Type to search"
            className="rounded-md border border-neutral-800 p-2 bg-transparent focus:outline-none w-[55%] text-white"
          />
        </div>
        <div className="nav-menu flex-1 pb-3 mt-8 md:block md:pb-0 md:mt-0">
          <ul className="items-center space-y-6 md:flex md:space-x-6 md:space-x-reverse md:space-y-0">
            <div className='flex-1 items-center justify-end gap-x-6 space-y-3 md:flex md:space-y-0'>
              {profile ? (
                <>
                  <li>
                    <a href="/upload" className="block py-3 px-4 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline">
                      New Video
                    </a>
                  </li>
                  <li>
                    <button onClick={logout} disabled={isLogoutPending} className="block py-3 px-4 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline">
                      Logout
                    </button>
                  </li>
                  <li>
                    {
                      profile.picture && profile.picture.__typename == 'MediaSet' ? (
                        <img src={profile.picture.original.url} width="50" height="50" className='rounded-full w-[50px] h-[50px]' />
                      ) : <div className="w-[50px] h-[50px] bg-slate-300 rounded-full" />
                    }
                  </li>
                </>
              ) : (
                <li>
                  <button onClick={onLoginClick} disabled={isLoginPending} className="block py-3 px-4 font-medium text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow md:inline">
                    Login with Lens
                  </button>
                </li>
              )}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}
