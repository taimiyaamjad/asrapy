'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating project icons using AI.
 *
 * The flow takes a project description as input and returns a data URI
 * containing a generated image.
 *
 * @remarks
 * - generateProjectIcon - A function that generates a project icon.
 * - GenerateProjectIconInput - The input type for the generateProjectIcon function.
 * - GenerateProjectIconOutput - The return type for the generateProjectIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectIconInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A description of the project for which to generate an icon.'),
});
export type GenerateProjectIconInput = z.infer<
  typeof GenerateProjectIconInputSchema
>;

const GenerateProjectIconOutputSchema = z.object({
  iconDataUri: z
    .string()
    .describe(
      'A data URI containing the generated icon image.  It must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Ensure proper documentation
    ),
});
export type GenerateProjectIconOutput = z.infer<
  typeof GenerateProjectIconOutputSchema
>;

export async function generateProjectIcon(
  input: GenerateProjectIconInput
): Promise<GenerateProjectIconOutput> {
  return generateProjectIconFlow(input);
}

const generateProjectIconPrompt = ai.definePrompt({
  name: 'generateProjectIconPrompt',
  input: {schema: GenerateProjectIconInputSchema},
  output: {schema: GenerateProjectIconOutputSchema},
  prompt: `Generate an icon appropriate for a project with the following description: {{{projectDescription}}}. The icon should be simple, visually appealing, and representative of the project's purpose. Return the icon as a data URI.

`,
});

const generateProjectIconFlow = ai.defineFlow(
  {
    name: 'generateProjectIconFlow',
    inputSchema: GenerateProjectIconInputSchema,
    outputSchema: GenerateProjectIconOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate an icon appropriate for a project with the following description: ${input.projectDescription}. The icon should be simple and visually appealing.`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate icon.');
    }

    return {iconDataUri: media.url};
  }
);
