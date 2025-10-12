"use client";
import { useState, useEffect } from "react";

export default function Logger() {
	const [visitors, setVisitors] = useState(0);

	useEffect(() => {
		async function initLogger() {
			const body = {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				// body: JSON.stringify({
				// 	clientSecret: "d34314a1-ef9e-46e9-85c1-0d75e48b5325",
				// 	applicationId: "e7d77b0a-e665-4686-a17f-e7e633aec624",
				// }),
				body: JSON.stringify({
					clientSecret: "7284daa1-9273-4065-ab8e-61a245a24956",
					applicationId: "60f8af1b-0ab7-42eb-9791-8be92f36da4e",
				}),
			};
			const res = await fetch(
				"https://logger-mocha-six.vercel.app/api/logger/v1",
				body
			);
			const json = await res.json();
			if (res.status === 200) {
				setVisitors(json);
			} else {
				// error
				console.log(json);
			}
		}
		initLogger();
	}, []);
	return (
		
        <div className="w-fit m-auto font-semibold gap-3 bg-gradient-to-b from-cyan-100/20 text-lg sm:text-xs p-3 sm:p-2 rounded-md shadow-md z-50">
        Visitors: <span className="text-green-500"> {visitors} </span>
      </div>
    //     <div className="w-fit m-auto  bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-xs p-3 sm:p-2 rounded-md shadow-lg z-50">
    //     Visitors: {visitors}
    //   </div>
	);
}
