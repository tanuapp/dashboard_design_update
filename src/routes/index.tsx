import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tanu — Үйлчилгээ хайх болон бизнесээ удирдах платформ" },
      {
        name: "description",
        content:
          "Гоо сайхан, эрүүл мэнд, сургалт, спорт болон өдөр тутмын үйлчилгээг web-ээр хайж, Tanu апп-аар цаг захиалаарай. Байгууллагууд Tanu Business-ээр үйл ажиллагаагаа удирдана.",
      },
      { property: "og:title", content: "Tanu — Үйлчилгээгээ олоод апп-аар захиалаарай" },
      {
        property: "og:description",
        content: "Tanu web-ээр үйлчилгээ хайж, харьцуулаад, мобайл апп-аар цаг захиалах боломжтой.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return <Shell />;
}

function Shell() {
  const { mode } = useApp();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const openBusinessSignup = () => navigate({ to: "/business/register" });

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
