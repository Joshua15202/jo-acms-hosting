import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Jo-AIMS",
  description: "Privacy policy for Jo Pacheco Wedding & Event Catering",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700">
        <p>
          At Jo Pacheco Wedding & Event Catering, we take your privacy seriously. This Privacy Policy outlines how we
          collect, use, and protect your personal information.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Information We Collect</h2>
        <p>
          We collect information you provide when booking appointments, making inquiries, or using our services. This
          may include your name, contact information, event details, and payment information.
        </p>

        <h2 className="mt-6 text-xl font-semibold">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6">
          <li>Process and manage your bookings and appointments</li>
          <li>Communicate with you about your events</li>
          <li>Improve our services and customer experience</li>
          <li>Send you relevant updates and promotional information (with your consent)</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information from unauthorized access,
          alteration, or disclosure.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. To exercise these rights, please
          contact us using the information provided below.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Contact Us</h2>
        <p>If you have any questions about our Privacy Policy, please contact us at (044) 308 3396 or 0917-8543221.</p>
      </div>
    </div>
  )
}
