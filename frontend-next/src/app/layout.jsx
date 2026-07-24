import "./globals.css";

export const metadata = {
  title: "Schedular Next Frontend",
  description: "Next.js frontend for Schedular",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
