import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import type { RequestHandler } from "../$types";
import { createS3GetUrl, createS3PutUrl } from "$lib/server/storage";

export const GET: RequestHandler = async (event: RequestEvent) => {
  if (!event.locals.user) {
    return error(401, "Unauthorized");
  }
  try {
    let params = new URLSearchParams(event.url.searchParams);
    const fileName = params.get("fileName");
    if (!fileName) {
      error(400, "fileName is required");
    }
    const url = await createS3GetUrl(fileName);
    return json({ url: url });
  } catch (err) {
    // For errors, log to console and send a 500 response back
    console.log(err);
    error(400, "something went wrong");
  }
};

export const PUT: RequestHandler = async (event: RequestEvent) => {
  if (!event.locals.user) {
    return error(401, "Unauthorized");
  }
  try {
    let params = new URLSearchParams(event.url.searchParams);
    const fileName = params.get("fileName");
    if (!fileName) {
      error(400, "fileName is required");
    }
    const url = await createS3PutUrl(fileName);
    return json({ url: url });
  } catch (err) {
    // For errors, log to console and send a 500 response back
    console.log(err);
    error(400, "something went wrong");
  }
};
