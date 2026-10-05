"use client";

import { useEffect, type ComponentProps } from "react";
import { ToastContainer as ReactToastContainer } from "react-toastify";

export function ToastContainer(props: ComponentProps<typeof ReactToastContainer>) {
	useEffect(() => {
		void fetch("/api/visitors", { cache: "no-store" })
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Visitor tracking failed (${response.status})`);
				}
			})
			.catch((error: unknown) => {
				console.error("Visitor tracking request failed:", error);
			});
	}, []);

	return <ReactToastContainer {...props} />;
}