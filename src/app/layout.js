import "./globals.css"
import Providers from "@/providers/Providers";

export const metadata = {
  title: "E-WasteMart",
  description: "A role based marketplace for responsible e-waste management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
