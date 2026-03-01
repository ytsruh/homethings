import ContactIcons from "~/components/ContactIcons";
import PageTitle from "~/components/PageTitle";

export default function Contact() {
	return (
		<>
			<title>Chris Hurst | Contact</title>
			<meta
				name="description"
				content="Get in touch with Chris Hurst on one of the social media platforms."
			/>
			<section className="w-full">
				<PageTitle
					title="Contact"
					description="Feel free to to contact me through any of the below methods."
				/>
				<ContactIcons />
			</section>
		</>
	);
}
