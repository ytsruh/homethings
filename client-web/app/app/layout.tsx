import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Homethings App",
  description: "Welcome to the Playground",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head />
      <body>{children}</body>
    </html>
  );
}
