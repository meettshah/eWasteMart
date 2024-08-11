import Footer1 from "@/components/Footer1";
import FrontPage from "@/components/FrontPage";
import Nav from "@/components/Nav";
import Card from "@/components/Card"
import HomePage from "@/components/HomePage";


export default function Home() {
  return (
    <>
      <Nav />
      <FrontPage />
      {/* <Card/> */}
      <HomePage/>
      <Footer1 />

    </>
  );
}
