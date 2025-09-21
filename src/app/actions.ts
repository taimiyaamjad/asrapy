"use server";

import { generateProjectIcon } from "@/ai/flows/generate-project-icon";
import { z } from "zod";

const iconSchema = z.object({
  description: z.string().min(10, "Please provide a longer description."),
});

type IconState = {
  message: string;
  iconDataUri?: string;
  errors?: {
    description?: string[];
  };
};

export async function generateIcon(
  prevState: IconState,
  formData: FormData
): Promise<IconState> {
  const validatedFields = iconSchema.safeParse({
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateProjectIcon({
      projectDescription: validatedFields.data.description,
    });
    
    if (result.iconDataUri) {
      return {
        message: "Icon generated successfully.",
        iconDataUri: result.iconDataUri,
      };
    } else {
      return { message: "Failed to generate icon. No data URI returned." };
    }
  } catch (error) {
    console.error(error);
    return { message: "An unexpected error occurred while generating the icon." };
  }
}
