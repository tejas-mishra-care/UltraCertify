'use server';

import { suggestApplicableCredits } from '@/ai/flows/suggest-applicable-credits';
import type { SuggestApplicableCreditsOutput } from '@/ai/flows/suggest-applicable-credits';

export async function getAISuggestions(images: string[]): Promise<SuggestApplicableCreditsOutput> {
  if (!images || images.length === 0) {
    return { suggestedCredits: ['No images provided.'] };
  }

  try {
    const result = await suggestApplicableCredits({ images });
    return result;
  } catch (error) {
    console.error('Error in getAISuggestions server action:', error);
    return { suggestedCredits: ['An error occurred while fetching AI suggestions. Please check the server logs.'] };
  }
}
