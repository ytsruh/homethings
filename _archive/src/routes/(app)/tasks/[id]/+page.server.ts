import { error } from "@sveltejs/kit";
import { data } from "../(data)/tasks";

export function load({ params }) {
  const task = data.find((task) => task.id === params.id);

  if (!task) {
    throw error(404, {
      message: "Task not found",
    });
  }

  return {
    task,
  };
}
