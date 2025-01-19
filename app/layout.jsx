import ".//globals.css";
import MarginWrapper from "@/components/marginwrapper";
import Navigation from "@/components/navigation";
import Providers from "@/components/provider"

export const metadata = {
  title: 'Yu',
  description: "The Best Korean Fashion Model Yu's Page"
};
export default async function RootLayout({ children }) {
 
  return (
    <html>
      <body>
        <Providers>
          <Navigation />
          <MarginWrapper>{children}</MarginWrapper> {/* 경로에 따라 마진 처리 */}
        </Providers>
      </body>
    </html>
  );
}