"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateIcon } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Wand2, Loader2, Image as ImageIcon } from "lucide-react";

const initialState = {
  message: "",
  iconDataUri: undefined,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Icon
        </>
      )}
    </Button>
  );
}

export function LogoGenerator() {
  const [state, formAction] = useFormState(generateIcon, initialState);

  return (
    <Card className="max-w-2xl mx-auto bg-card">
      <CardContent className="p-6">
        <form action={formAction} className="grid gap-4">
          <Textarea
            name="description"
            placeholder="e.g., A mobile app for tracking personal fitness goals..."
            rows={3}
            required
            aria-describedby="description-error"
          />
          {state.errors?.description && (
            <p id="description-error" className="text-sm text-destructive">
              {state.errors.description.join(", ")}
            </p>
          )}

          <SubmitButton />

          {state.message && !state.errors && (
            <p className={`text-sm ${state.iconDataUri ? 'text-green-600' : 'text-destructive'}`}>
              {state.message}
            </p>
          )}
        </form>
        
        <div className="mt-6">
          {state.iconDataUri ? (
            <div className="flex flex-col items-center gap-4">
              <p className="font-semibold text-foreground">Your Generated Icon:</p>
              <div className="relative h-32 w-32 rounded-lg border bg-muted p-2">
                <Image
                  src={state.iconDataUri}
                  alt="Generated Project Icon"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Your icon will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
