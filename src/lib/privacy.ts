export interface PrivacySection {
  title: string;
  description?: string;
  subsection?: { title: string; description: string }[];
  isList?: boolean;
  listItems?: string[];
}

export const privacyData: PrivacySection[] = [
  {
    title: "1. Collection and Use of Information",
    description:
      "We collect certain types of information with the goal of providing you with more accurate and pleasant services, constantly updating and improving them. This activity can be categorized and defined as follows:",
  },
  {
    title: "2. Types and Categories of Information Collected",
    subsection: [
      {
        title: "2.1 Personal Information",
        description:
          'To fully benefit from the advantages of the services we offer, it is required to collect personal identifying information ("personal information") that is used to contact you and identify you. Personal identifying information may include, but is not limited to, the following types of data.',
      },
      {
        title: "2.2 Service Usage Information",
        description:
          "When you access the TanuSoft service via a mobile device, we collect usage information sent by your device. Usage information may include your Internet Protocol (IP) address, the time and date of your visit.",
      },
      {
        title: "2.3 Monitoring and Cookie Information",
        description:
          "Within the scope of our service, we use cookies and similar tracking technologies to store certain types of information. Cookies are small data files that are sent from a website to your device and stored on your device. Other tracking technologies may be used to collect, track, and record information for the purpose of improving and analyzing the service. You can configure your browser to refuse all cookies or to notify you when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some parts of our service.",
      },
      {
        title: "2.4 Cookies We Use",
        description:
          "Shared Preferences: We use these cookies to operate our service efficiently. Example: Save user data on their device to automatically authenticate users.",
      },
    ],
  },
  {
    title: "3. Use of Data",
    isList: true,
    listItems: [
      "To ensure the proper and stable provision of our service",
      "To notify and inform you of changes within the scope of the service",
      "To allow you to use the interactive parts of the service according to your preferences",
      "To provide customer support and care services to users",
      "To provide analytical information about the service for the purpose of developing and improving the service",
      "To monitor and adjust service usage",
      "To detect, identify, and prevent technical issues and malfunctions",
    ],
  },
  {
    title: "4. Transfer of Data",
    description:
      "Your personal data may be transferred to and stored on computers located outside of your administrative jurisdiction, where data protection laws may differ from those in your region. If you are located outside Mongolia and choose to share your information with us, please note that your personal information and data related to service usage will be transferred to and processed in Mongolia. By accepting this Privacy Policy and the terms described herein, you also agree to the transfer of data. TanuSoft will take all necessary measures to ensure the security and protection of your information within the scope of the service, and will not transfer this data to unregulated or uncontrolled organizations or countries.",
  },
  {
    title: "5. Deletion of Data",
    description:
      "The personal information collected on TanuSoft can be deleted at the request of the user. You will need to contact us through the registered email address or phone number associated with your account. In such cases, please contact us via our customer service at info@tanusoft.mn or call 7700-1005. Upon receiving a request to delete personal information through the above channels, we will delete the information related to the user from the service within three business days.",
  },
  {
    title: "6. Disclosure of Data",
    subsection: [
      {
        title: "6.1 Legal Requirements",
        description:
          "TanuSoft may disclose your personal information under the following circumstances:",
      },
      {
        title: "6.2 Data Security",
        description:
          "The security of your data and information is very important to us. However, please remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.",
      },
    ],
  },
  {
    title: "7. Changes to the Privacy Policy",
    description:
      "We may update this Privacy Policy to reflect legal changes or to adapt to current conditions. We will notify you of any changes and post the updated version on this page. Before the changes become effective, we will inform you via the email address associated with your account and/or within the scope of the service. The effective date of the updated Privacy Policy will be indicated at the top of this page. We recommend that you regularly review this Privacy Policy for any changes. The updated Privacy Policy will become effective once it is posted on this page.",
  },
];
