import { SocketProvider } from "@/context/SocketContext";
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
