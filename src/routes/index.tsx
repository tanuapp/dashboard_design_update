import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "@/lib/app-context";
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
import { BookingModal } from "@/components/modals/BookingModal";
import { BusinessSignupModal } from "@/components/modals/BusinessSignupModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tanu — Үйлчилгээ захиалах болон бизнесээ удирдах платформ" },
      { name: "description", content: "Гоо сайхан, эрүүл мэнд, сургалт, спорт болон өдөр тутмын үйлчилгээг Tanu-аас нэг дороос захиал. Байгууллагууд Tanu Business-ээр үйл ажиллагаагаа удирд." },
      { property: "og:title", content: "Tanu — Үйлчилгээ, цаг захиалга нэг дороос" },
      { property: "og:description", content: "Tanu — үйлчилгээ хайх, цаг захиалах, бизнесээ удирдах нэгдсэн платформ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { mode } = useApp();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const scrollToServices = () => {
    setTimeout(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar
        onOpenBooking={() => setBookingOpen(true)}
        onOpenBusinessSignup={() => setSignupOpen(true)}
      />

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
              <UserHero onSearch={scrollToServices} onOpenBooking={() => setBookingOpen(true)} />
              <PartnerMarquee />
              <Categories selected={categoryFilter} onSelect={(c) => { setCategoryFilter(c); scrollToServices(); }} />
              <Services categoryFilter={categoryFilter} />
              <HowItWorks />
              <Benefits />
              <MobileAppSection />
              <Testimonials />
              <UserCta onOpenBooking={() => setBookingOpen(true)} />
            </>
          ) : (
            <>
              <BusinessHero onOpenSignup={() => setSignupOpen(true)} />
              <PartnerMarquee />
              <BusinessFeatures />
              <BookingCalendar />
              <BusinessAnalytics />
              <BusinessWorkflow />
              <BusinessTypes />
              <BusinessCta onOpenSignup={() => setSignupOpen(true)} />
            </>
          )}
        </motion.main>
      </AnimatePresence>

      <Footer />
      <BackToTop />

      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
      <BusinessSignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </div>
  );
}
