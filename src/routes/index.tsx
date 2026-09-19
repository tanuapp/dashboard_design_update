import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "@/lib/app-context";
import { Background } from "@/components/effects/Background";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { UserHero } from "@/components/user/UserHero";
import { Categories } from "@/components/user/Categories";
import { Services } from "@/components/user/Services";
import { HowItWorks, Benefits } from "@/components/user/HowAndBenefits";
import { MobileAppSection, Testimonials, UserCta } from "@/components/user/AppTestimonialsCta";
import { PartnerMarquee } from "@/components/shared/PartnerMarquee";
import { BusinessHero } from "@/components/business/BusinessHero";
import {
  BusinessFeatures,
  BookingCalendar,
  BusinessAnalytics,
  BusinessWorkflow,
  BusinessTypes,
  BusinessCta,
} from "@/components/business/BusinessSections";
import { BusinessPackages } from "@/components/business/BusinessPackages";

const homeTitle = "TANU web Захиалга бүртгэлийн нэгдсэн платформ";
const homeDescription =
  "Эмнэлэг Гоо сайхны салон Сургалт гэх мэт үйлчилгээний байгууллагуудын цаг захиалга мөн Тоглолт кино театр үзвэрийн тасалбар зэрэг үйлчилгээг нэг дороос захиалан аваарай";
const homeUrl = "https://www.tanu.mn/";
const socialImageUrl = "https://www.tanu.mn/brand/logowhite.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: homeTitle },
      { name: "description", content: homeDescription },
      { property: "og:title", content: homeTitle },
      { property: "og:description", content: homeDescription },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TANU" },
      { property: "og:url", content: homeUrl },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:alt", content: "TANU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: homeTitle },
      { name: "twitter:description", content: homeDescription },
      { name: "twitter:image", content: socialImageUrl },
    ],
    links: [{ rel: "canonical", href: homeUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TANU",
            url: homeUrl,
            logo: socialImageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "TANU",
            url: homeUrl,
          },
        ]),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return <Shell />;
}

function Shell() {
  const { mode } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const openBusinessSignup = () => {
    window.location.href = "https://admin.tanu.mn/auth/boxed-signup";
  };

  const scrollToServices = () => {
    setTimeout(
      () =>
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar onOpenBusinessSignup={openBusinessSignup} />

      <AnimatePresence mode="wait">
        <motion.main
          key={mode}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)", scale: 0.995 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)", scale: 0.995 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === "user" ? (
            <>
              <UserHero onSearch={scrollToServices} />
              <PartnerMarquee />
              <Categories
                selected={categoryFilter}
                onSelect={(c) => {
                  setCategoryFilter(c);
                  scrollToServices();
                }}
              />
              <Services categoryFilter={categoryFilter} />
              <HowItWorks />
              <Benefits />
              <MobileAppSection />
              <Testimonials />
              <UserCta />
            </>
          ) : (
            <>
              <BusinessHero onOpenSignup={openBusinessSignup} />
              <PartnerMarquee />
              <BusinessFeatures />
              <BookingCalendar />
              <BusinessAnalytics />
              <BusinessPackages />
              <BusinessWorkflow />
              <BusinessTypes />
              <BusinessCta onOpenSignup={openBusinessSignup} />
            </>
          )}
        </motion.main>
      </AnimatePresence>

      <Footer />
      <BackToTop />
    </div>
  );
}
