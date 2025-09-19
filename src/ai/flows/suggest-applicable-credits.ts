'use server';

/**
 * @fileOverview AI flow to suggest applicable credits based on uploaded images.
 *
 * - suggestApplicableCredits - A function that suggests applicable credits based on uploaded images.
 * - SuggestApplicableCreditsInput - The input type for the suggestApplicableCredits function.
 * - SuggestApplicableCreditsOutput - The return type for the suggestApplicableCredits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestApplicableCreditsInputSchema = z.object({
  images: z
    .array(
      z.string().describe(
        "A list of images as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      )
    )
    .describe('A list of images uploaded by the user.'),
});
export type SuggestApplicableCreditsInput = z.infer<typeof SuggestApplicableCreditsInputSchema>;

const SuggestApplicableCreditsOutputSchema = z.object({
  suggestedCredits: z
    .array(z.string())
    .describe('A list of suggested credits based on the uploaded images.'),
});
export type SuggestApplicableCreditsOutput = z.infer<typeof SuggestApplicableCreditsOutputSchema>;

export async function suggestApplicableCredits(
  input: SuggestApplicableCreditsInput
): Promise<SuggestApplicableCreditsOutput> {
  return suggestApplicableCreditsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestApplicableCreditsPrompt',
  input: {schema: SuggestApplicableCreditsInputSchema},
  output: {schema: SuggestApplicableCreditsOutputSchema},
  prompt: `You are an expert in green building certifications.

  Based on the following images, suggest a list of applicable credits that the user might be able to earn for their project.

  {% for image in images %}
  Image {{ loop.index }}: {{media url=image}}
  {% endfor %}

  Please provide a list of suggested credits.`, // Handlebars syntax
});

const suggestApplicableCreditsFlow = ai.defineFlow(
  {
    name: 'suggestApplicableCreditsFlow',
    inputSchema: SuggestApplicableCreditsInputSchema,
    outputSchema: SuggestApplicableCreditsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
