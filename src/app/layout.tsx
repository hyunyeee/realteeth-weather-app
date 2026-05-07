import { Metadata } from "next";
import { Providers } from "@/app/providers";
import { pretendard } from "@/styles/font";
import "./globals.css";

export const metadata: Metadata = {
  title: "리얼티쓰 날씨 앱 - 오현의  ",
  description: "프론트엔드 개발자 채용 날씨 앱 구현 과제 - 오현의 ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full min-h-screen`}>
      <body
        className={`${pretendard.className} h-full min-h-screen w-full overflow-auto text-black`}
      >
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
