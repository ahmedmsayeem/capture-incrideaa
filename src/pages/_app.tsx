import { type AppType } from "next/app";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import "~/styles/globals.css";
import "~/styles/embla.css";
import dynamic from "next/dynamic";
import Script from "next/script";
import SEO from "~/components/SEO";
import KeyboardShortcut from "~/components/Shortcuts";
import NoAuthComponent from "./NoAuthComponent"; // Import the NoAuthComponent
import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SEO/>
      <KeyboardShortcut />
      <Script
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=G-QRVG032QD4"
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QRVG032QD4', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <NoAuthComponent Component={Component} pageProps={pageProps} /> {/* Use NoAuthComponent here */}
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);