import React from "react";
import Head from "next/head";
import "@/lib/styles/index.css";

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
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
    </>
  );
}

export default App;
