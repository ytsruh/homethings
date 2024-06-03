"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { profileFormSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { SelectUser } from "@/db/schema";

export function ProfileForm({ action, profile }: { action: Function; profile: SelectUser }) {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      showDocuments: profile.showDocuments,
      showBooks: profile.showBooks,
    },
  });

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    // Do something with the form values. They are type-safe and validated.
    // Pass the form data to the action handler.
    action({}, values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col justify-center items-center gap-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="User Name" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full py-2 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
          <FormField
            control={form.control}
            name="showDocuments"
            render={({ field }) => (
              <FormItem className="w-full flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>Show Documents:</FormLabel>
                  <FormDescription>Shows/hides documents in the app</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showBooks"
            render={({ field }) => (
              <FormItem className="w-full flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>Show Books:</FormLabel>
                  <FormDescription>Shows/hides books in the app</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between w-full py-5">
          <Button asChild variant="secondary">
            <Link href="/">Cancel</Link>
          </Button>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </Form>
  );
}
