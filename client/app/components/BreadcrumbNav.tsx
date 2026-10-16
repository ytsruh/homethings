import React from "react";
import { Link, useLocation } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function BreadcrumbNav() {
	const location = useLocation();

	const pathSegments = location.pathname.split("/").filter((segment) => {
		return segment !== "" && segment !== "app";
	});

	return (
		<Breadcrumb className="hidden md:flex">
			<BreadcrumbList className="my-3 ml-3">
				<BreadcrumbItem>
					<BreadcrumbLink render={<Link to="/app" />}>Home</BreadcrumbLink>
				</BreadcrumbItem>
				{pathSegments.map((segment, index) => {
					const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
					const isLast = index === pathSegments.length - 1;

					return (
						<React.Fragment key={path}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>
										{segment.charAt(0).toUpperCase() + segment.slice(1)}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink render={<Link to={`/app${path}`} />}>
										{segment.charAt(0).toUpperCase() + segment.slice(1)}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
