import type { Metadata } from "next";
import "./globals.css";
import "./minigames.css";
import "./studio.css";
import "./suggestions.css";
import "./wow-games.css";
import "./secret-builder.css";

export const metadata: Metadata = {
  title: "HeartQuest — เปลี่ยนความทรงจำให้เป็นเกมรัก",
  description: "สร้างเกมพิกเซลจากเรื่องราวของคุณ แล้วส่งเป็นลิงก์ให้คนพิเศษ",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
