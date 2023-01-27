import type { AppType } from "next/app";
import { trpc } from "@/lib/trpc";
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
          content="Watch Homeflix films &amp; TV programmes online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more."
        />
        <title>Homeflix | Like Netflix, but crappier</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
