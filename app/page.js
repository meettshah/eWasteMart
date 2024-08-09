import Footer1 from "@/components/Footer1";
import FrontPage from "@/components/FrontPage";
import Nav from "@/components/Nav";
import SignUpForm from "@/components/signup";
import Form from "@/components/profile_for_user";
import Form02 from "@/components/profile_for_Recyclers";
import Form03 from "@/components/profile_for_scrappers";



export default function Home() {
  return (
    <>
      <Nav />
      {/* <SignUpForm/> */}
      <FrontPage />
        
      {/* <div className={'border dark:border-[#444] w-[400px] mx-auto py-12 rounded-3xl shadow-lg'} title={"Add criminal details"}>
        <Form />
      </div> */}
      {/* <div className={'border dark:border-[#444] w-[400px] mx-auto py-12 rounded-3xl shadow-lg'} title={"Add criminal details"}>
        <Form02 />
      </div> */}
      {/* <div className={'border dark:border-[#444] w-[400px] mx-auto py-12 rounded-3xl shadow-lg'} title={"Add criminal details"}>
        <Form03 />
      </div> */}
    
      <Footer1 />
    </>
  );
}
