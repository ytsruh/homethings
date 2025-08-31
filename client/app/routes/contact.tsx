import type { Route } from "./+types/contact";
import ContactIcons from "~/components/ContactIcons";
import PageTitle from "~/components/PageTitle";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Chris Hurst | Contact",
      description:
        "Get in touch with Chris Hurst on one of the social media platforms.",
    },
  ];
}

export default function Contact() {
  return (
    <section className="w-full">
      <PageTitle
        title="Contact"
        description="Feel free to to contact me through any of the below methods."
      />
      <ContactIcons />
    </section>
  );
}
