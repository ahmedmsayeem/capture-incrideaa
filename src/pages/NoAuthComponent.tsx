import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ScrollArea } from "~/components/ui/scroll-area";
import Header from "~/components/HeaderFooter/Header";
import Footer from "~/components/HeaderFooter/Footer";
import TrackPageVisits from "~/components/TrackPageVisits";
import CameraLoading from "~/components/LoadingAnimation/CameraLoading";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from "next/dynamic";
import SEO from "~/components/SEO";
import Script from "next/script";
import KeyboardShortcut from "~/components/Shortcuts";

const useRouteLoading = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [router]);

  return loading;
};

const NoAuthComponent = ({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) => {
  const loading = useRouteLoading();
  const queryClient = new QueryClient();
  const pathname = useRouter().pathname;
  const isCapturesPath = pathname === "/captures";

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollArea className="font-roboto flex h-screen min-h-screen w-full flex-1 flex-col" id="main-scroller"> 
        <div className="font-roboto flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">
            <Toaster position="top-right" reverseOrder={false} />
            <TrackPageVisits />
            {loading ? <CameraLoading /> : <Component {...pageProps} />}
          </main>
          {!isCapturesPath && <Footer />}
        </div>
      </ScrollArea>
    </QueryClientProvider>
  );
};

export default NoAuthComponent;