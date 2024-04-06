import { Providers } from "@/components/Providers";
import "@/lib/styles/index.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homethings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
