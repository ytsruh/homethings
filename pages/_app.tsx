import type { AppType } from "next/app";
import Head from "next/head";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import "@/lib/styles/index.css";

const App: AppType<{ session: Session }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#d9230f" />
        <meta
          name="description"
          content="Watch films, TV shows or look at your book collection. More things will probably come in the future. Don't get too excited."
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <title>Homethings | The crappy home app</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;
