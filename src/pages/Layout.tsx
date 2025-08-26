import Head from "next/head";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>PAJM Asset Management Portal</title>
        <meta />
      </Head>
      <div>{children}</div>
    </>
  );
}
