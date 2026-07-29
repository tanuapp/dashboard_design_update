# Tanu Redesign

Create a complete, production-quality frontend redesign for the Tanu.mn landing website.

IMPORTANT:

This task is FRONTEND DESIGN ONLY.

Do not create a backend, database, real authentication, payment integration, or API.

Use mock data and local frontend state only.

All visible buttons, tabs, navigation links, theme controls, sliders, and mode switches must work interactively.

The current Tanu.mn content structure may be used as a general reference, but do not copy its current visual design. Completely redesign the website with a premium, modern, technology-focused appearance.

==================================================

PROJECT GOAL

==================================================

Tanu is a service discovery and appointment booking platform with two audiences:

1. Regular users who search for services and book appointments.

2. Businesses and organizations that manage services, employees, schedules, customers, and bookings.

The website must have two distinct modes:

- User mode

- Business mode

The default landing page must open in User mode.

The mode switch must be clearly visible in the navbar:

[ Хэрэглэгч ] [ Байгууллага ]

When the visitor switches from User to Business mode:

- Change the main logo.

- Change the hero text.

- Change the CTA buttons.

- Change the hero visual.

- Change the background effects slightly.

- Change the navigation items where necessary.

- Change the main content sections.

- Keep the transition smooth and premium.

- Do not perform a full page reload.

- Preserve the currently selected dark or light theme.

Use a soft fade, blur, slide, and scale transition when changing modes.

==================================================

BRANDING AND LOGOS

==================================================

There are two different Tanu brand logos.

USER LOGO:

Use the uploaded blue gradient Tanu wordmark logo.

This logo represents the customer-facing Tanu booking application.

BUSINESS LOGO:

Use the uploaded navy and white triangular Tanu icon.

This logo represents Tanu Business and organizations.

User mode must feel:

- Friendly

- Accessible

- Energetic

- Modern

- Service-oriented

- Mobile-app focused

Business mode must feel:

- Professional

- Premium

- Reliable

- Enterprise-oriented

- Data-driven

- Dashboard focused

Do not distort, redraw, rotate, crop, or modify the shape of either logo.

Create reusable logo components with suitable versions for dark and light backgrounds.

==================================================

TECHNOLOGY

==================================================

Build this as a clean frontend using:

- Next.js

- TypeScript

- Tailwind CSS

- shadcn/ui

- Framer Motion

- Lucide icons

Use reusable React components.

Keep the code clean and easy to continue developing.

Do not use heavy WebGL libraries.

Background effects should be created with performant CSS, gradients, SVG, and lightweight animation.

Use semantic HTML and accessible controls.

==================================================

GLOBAL DESIGN DIRECTION

==================================================

Create a premium SaaS and marketplace visual style.

Avoid:

- Generic template appearance

- Excessive minimalism

- Huge empty spaces

- Overcrowded cards

- Random gradients

- Very strong glow

- Excessive animation

- Tiny unreadable typography

- Oversized buttons

- Old-fashioned corporate layouts

Use:

- Strong visual hierarchy

- Comfortable spacing

- Rounded but not excessively rounded components

- Thin borders

- Soft shadows

- Glass and blur effects only where appropriate

- High-quality typography

- Subtle depth

- Consistent component sizing

- Smooth animations

- Clear calls to action

The design should feel like a combination of:

- Modern booking marketplace

- Premium mobile application

- Professional business management platform

- High-end SaaS website

==================================================

COLOR SYSTEM

==================================================

USER MODE LIGHT:

- White and soft blue-tinted background

- Deep navy text

- Blue and cyan gradient accents

- Soft blue glow

- Clean white cards

USER MODE DARK:

- Near-black navy background

- White and muted blue text

- Electric blue accents

- Soft cyan and blue atmospheric glow

BUSINESS MODE LIGHT:

- White, soft gray, and very light navy background

- Deep navy primary color

- Muted blue accent

- Professional dashboard styling

BUSINESS MODE DARK:

- Deep navy and near-black background

- White and cool gray text

- Refined blue highlights

- Subtle grid and orbit effects

Do not use completely different unrelated color palettes.

Both modes must still feel like one Tanu brand ecosystem.

==================================================

DARK AND LIGHT MODE

==================================================

Add a fully working dark/light mode toggle.

Requirements:

- Respect the device system theme on first visit.

- Allow the visitor to manually switch themes.

- Save the selected theme in localStorage.

- Keep the selected theme when switching between User and Business modes.

- Create separate polished visual states for both themes.

- Do not simply invert colors.

- Ensure cards, text, logos, borders, shadows, and background effects look correct in both themes.

Use an animated sun and moon icon transition.

==================================================

BACKGROUND EFFECTS

==================================================

Create a premium animated background inspired by technology interfaces and orbital systems.

Use combinations of:

- Large blurred radial gradients

- Thin grid lines

- Slow orbit circles

- Floating particles or dots

- Soft moving light beams

- Subtle noise texture

- Mouse-following glow on desktop

- Very slow background movement

- Scroll-based parallax only where subtle

USER MODE BACKGROUND:

- Softer and brighter

- Blue and cyan glow

- Friendly floating cards

- App-oriented visual energy

BUSINESS MODE BACKGROUND:

- Darker and more structured

- Thin grid

- Orbit rings

- Dashboard data points

- Controlled enterprise feeling

Requirements:

- Effects must remain behind the content.

- Text must always stay readable.

- Effects must not block clicks.

- Keep animations smooth and lightweight.

- Disable or reduce complex effects on mobile.

- Respect prefers-reduced-motion.

==================================================

NAVBAR

==================================================

Create a sticky responsive navbar.

Initial state:

- Transparent or nearly transparent

- Integrated with the hero background

Scrolled state:

- Slightly smaller height

- Semi-transparent background

- Backdrop blur

- Thin bottom border

- Soft shadow

Desktop layout:

Left:

- Dynamic Tanu logo

Center:

User mode navigation:

- Нүүр

- Үйлчилгээ

- Ангилал

- Хэрхэн ажилладаг вэ?

- Байгууллагууд

Business mode navigation:

- Нүүр

- Боломжууд

- Шийдлүүд

- Үнийн мэдээлэл

- Tanu Business

Right:

- User / Business segmented mode switch

- Dark / light theme toggle

- Нэвтрэх

- Primary CTA button

User CTA:

- Цаг захиалах

Business CTA:

- Байгууллага бүртгүүлэх

Mobile:

- Logo

- Mode switch

- Theme toggle

- Menu button

- Animated mobile drawer

- All menu links and CTAs must work

==================================================

USER MODE HERO

==================================================

Default page mode must be User mode.

Hero eyebrow:

Үйлчилгээг илүү хялбар захиалаарай

Main headline:

Өөрт хэрэгтэй үйлчилгээг

нэг дороос олоорой

Highlight an important phrase with a tasteful blue gradient.

Description:

Гоо сайхан, эрүүл мэнд, сургалт, спорт болон өдөр тутмын үйлчилгээг хайж, тохирох цагаа сонгон хялбар захиалаарай.

Primary CTA:

Үйлчилгээ хайх

Secondary CTA:

Tanu апп татах

Add a compact search interface inside or below the hero:

- Үйлчилгээ эсвэл байгууллага

- Байршил

- Огноо

- Хайх button

It does not need backend search.

When the search button is pressed, smoothly scroll to the service discovery section and show mock filtered cards.

Hero visual:

- Modern mobile application mockup

- Floating appointment card

- Rating card

- Calendar or time slot card

- Organization card

- Soft animated blue glow

- Avoid using a generic stock photo

Add small trust indicators:

- Verified organizations

- Fast booking

- Real customer reviews

==================================================

BUSINESS MODE HERO

==================================================

When Business mode is selected, replace the user hero content.

Eyebrow:

Tanu Business

Main headline:

Бизнесийн бүх үйл ажиллагааг

нэг дороос удирд

Description:

Захиалга, ажилтан, үйлчилгээ, хуваарь, хэрэглэгч болон тайлангаа нэг системээс хялбар удирдаарай.

Primary CTA:

Байгууллага бүртгүүлэх

Secondary CTA:

Dashboard үзэх

Hero visual:

- Premium admin dashboard mockup

- Appointment calendar

- Daily revenue summary

- Employee status

- Booking statistics

- Customer activity cards

- Animated chart lines or data points

- Use mock data only

Do not make it look like a cryptocurrency or trading dashboard.

It must clearly look like a service business management dashboard.

==================================================

PARTNER LOGO MARQUEE

==================================================

Do not use a large scrolling category text banner.

Instead, create a partner organization logo marquee.

Section label:

Tanu-тай хамтран ажилладаг байгууллагууд

Create two optional slowly moving rows of partner logos.

Requirements:

- Infinite seamless horizontal animation

- First row can move left

- Second row can move right

- Slow, calm movement

- Pause on hover

- Logos should be monochrome by default

- Show original logo color on hover

- Dark mode logos should remain readable

- Add soft edge masks on the left and right

- Do not make logos too large

- Use placeholder partner logo cards where real assets are unavailable

- Make logo assets easy to replace later

In Business mode, change the label to:

Tanu Business ашиглаж буй байгууллагууд

==================================================

USER MODE SECTIONS

==================================================

Create the following sections for User mode.

1. Popular categories

Display a clean responsive category grid.

Example categories:

- Гоо сайхан

- Эрүүл мэнд

- Сургалт

- Спорт

- Авто үйлчилгээ

- Энтертайнмент

- Мэргэжлийн үйлчилгээ

- Бусад

Each category card should include:

- Icon

- Category name

- Number of available organizations

- Hover animation

- Click interaction that filters the mock services

2. Discover services

Tabs:

- Онцлох

- Ойрхон

- Өнөөдөр боломжтой

- Шинээр нэмэгдсэн

Service cards must include:

- Image placeholder

- Organization name

- Service name

- Rating

- Review count

- Location

- Starting price

- Available time

- Favorite button

- Booking button

Buttons and tabs must work with mock frontend state.

3. How Tanu works

Three clear steps:

- Үйлчилгээгээ хайх

- Цагаа сонгох

- Захиалгаа баталгаажуулах

Use visual timeline cards or connected steps.

4. Why use Tanu

Benefits:

- Нэг дор олон үйлчилгээ

- Баталгаажсан байгууллагууд

- Хялбар цаг захиалга

- Захиалгын сануулга

- Үнэлгээ, сэтгэгдэл

- Урамшуулал

5. Mobile application section

Show:

- Mobile app mockup

- App Store button

- Google Play button

- QR code placeholder

- Main app benefits

Headline:

Tanu апптай бүх үйлчилгээ илүү ойр

6. Customer testimonials

Create polished testimonial cards with:

- Avatar placeholder

- Name

- Rating

- Short review

- Used service category

Use mock Mongolian content.

7. User CTA section

Headline:

Дараагийн үйлчилгээгээ Tanu-аас захиалаарай

Buttons:

- Үйлчилгээ хайх

- Апп татах

==================================================

BUSINESS MODE SECTIONS

==================================================

Create different sections when Business mode is selected.

1. Business platform overview

Show a full dashboard preview surrounded by floating feature cards.

2. Main business features

Feature cards:

- Захиалгын удирдлага

- Ажилтны хуваарь

- Үйлчилгээний удирдлага

- Хэрэглэгчийн мэдээлэл

- Салбарын удирдлага

- Борлуулалтын тайлан

- Сануулга, мэдэгдэл

- Tanu marketplace

3. Booking calendar section

Show a detailed mock calendar interface:

- Day and week view

- Employee columns

- Booking cards

- Status indicators

- Add booking button

- Filter

- Date controls

All interactions should work locally.

4. Business analytics section

Show mock data:

- Өнөөдрийн захиалга

- Орлого

- Шинэ хэрэглэгч

- Цуцлагдсан захиалга

- Revenue chart

- Popular services

- Employee performance

5. Business workflow

Steps:

- Байгууллагаа бүртгүүлэх

- Үйлчилгээ, ажилтнаа нэмэх

- Захиалгаа хүлээн авах

- Үр дүнгээ хянах

6. Business types

Cards:

- Гоо сайхны салон

- Эмнэлэг, эрүүл мэнд

- Сургалтын төв

- Фитнес, спорт

- Авто үйлчилгээ

- Зөвлөх үйлчилгээ

- Тасалбар, арга хэмжээ

- Бусад үйлчилгээ

7. Business CTA

Headline:

Бизнесээ Tanu-тай хамт өсгөөрэй

Description:

Хуваарь, захиалга, ажилтан болон хэрэглэгчээ нэг системээс удирдаж, шинэ хэрэглэгчдэд хүрээрэй.

Buttons:

- Үнэгүй эхлүүлэх

- Demo үзэх

==================================================

FOOTER

==================================================

Create a large but clean responsive footer.

Include:

- Dynamic Tanu logo based on current mode

- Short company description

- Product links

- User links

- Business links

- Support links

- Legal links

- Social icons

- Contact details

- App download buttons

Footer bottom:

© Tanu. Бүх эрх хуулиар хамгаалагдсан.

Include:

- Нууцлалын бодлого

- Үйлчилгээний нөхцөл

==================================================

INTERACTIONS

==================================================

The following interactions must work:

- User / Business mode switch

- Dark / light mode switch

- Desktop navigation

- Mobile navigation drawer

- Category selection

- Service tabs

- Favorite buttons

- Mock search button

- Booking button

- Dashboard demo button

- FAQ accordion if included

- Partner marquee pause on hover

- Smooth anchor scrolling

- Back-to-top button

- Scroll-based navbar styling

For booking buttons:

Open a frontend-only modal showing:

- Service

- Organization

- Date

- Available times

- Confirm button

After confirmation, show a success state.

Do not connect it to any backend.

For business registration:

Open a frontend-only demo modal with:

- Organization name

- Business type

- Phone

- Email

- Continue button

After submitting, show a demo success message.

Do not send data anywhere.

==================================================

RESPONSIVE DESIGN

==================================================

The site must be fully responsive.

Desktop:

- Rich background effects

- Large dashboard and app mockups

- Multi-column layouts

Tablet:

- Balanced two-column sections

- Reduced floating elements

Mobile:

- Single-column layout

- Compact navbar

- Mobile drawer

- Reduced background animation

- Touch-friendly controls

- No horizontal overflow

- Partner logo marquee remains smooth

- Hero text remains readable

- Cards must not feel cramped

Test typical widths:

- 1440px

- 1280px

- 1024px

- 768px

- 430px

- 390px

==================================================

ANIMATION

==================================================

Use Framer Motion for:

- Hero entrance

- Mode switching

- Logo transition

- Card reveal on scroll

- Section transitions

- Floating mockup elements

- Button feedback

- Modal opening and closing

- Mobile menu

Animations must be:

- Smooth

- Subtle

- Professional

- Fast enough to avoid slowing navigation

Avoid animating every small text element separately.

==================================================

ACCESSIBILITY AND QUALITY

==================================================

- Maintain proper color contrast

- Add visible keyboard focus states

- Use semantic buttons

- Add aria-labels for icon buttons

- Support keyboard navigation

- Add alt text to images

- Respect reduced motion

- Avoid layout shift

- Avoid horizontal scrolling

- Keep loading performance reasonable

==================================================

IMPORTANT IMPLEMENTATION RULES

==================================================

- Frontend only

- No backend

- No database

- No real authentication

- No external payment integration

- No unfinished placeholder screens

- Do not create non-working buttons

- Use realistic Mongolian mock content

- Use reusable components

- Keep mock data in a separate file

- Make logos and organization assets easy to replace

- Do not copy the current Tanu website design

- Do not replace the supplied logos with generated logos

- Do not change the logo shapes

- Do not use random English text where Mongolian content is appropriate

- Do not use excessive lorem ipsum

- The final result must feel complete and presentation-ready

Start by generating the full responsive landing page with both User and Business modes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/146a1296-6d97-4d45-9f7a-c0856c5b637f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
