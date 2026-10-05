import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Howitworks from "@/components/Howitworks";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import AboutVideoGrab from "@/components/about";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/ScrollReveal";

const page = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <ScrollReveal>
        <Howitworks />
      </ScrollReveal>
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <div className="h-px w-full bg-background" aria-hidden="true" />
      <ScrollReveal>
        <AboutVideoGrab />
      </ScrollReveal>
      <div className="h-px w-full bg-background" aria-hidden="true" />
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </>
  );
};

export default page;
