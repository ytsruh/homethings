import PageHeader from "~/components/PageHeader";

export default function Dashboard() {
	return (
		<>
			<title>Dashboard | Homethings</title>
			<meta name="description" content="Welcome to Homethings" />
			<div className="space-y-6">
				<PageHeader
					title="Dashboard"
					subtitle="Welcome to Homethings"
				></PageHeader>
			</div>
		</>
	);
}
