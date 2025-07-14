import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <link rel="icon" href="/portal_logo.png" />
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
