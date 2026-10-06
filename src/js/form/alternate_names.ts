/**
 * Alternate names and options config for fuzzy form field matching.
 * Maps Symposium API field names to common CfP form field synonyms.
 */

export interface AlternateNamesConfig {
  /** Maps Symposium data key → array of field label synonyms to match against */
  alternateDataNames: Record<string, string[]>;
  /** Maps Symposium data key → maps data value → array of dropdown option synonyms */
  alternateOptions: Record<string, Record<string, string[]>>;
  /** Symposium API keys to ignore when filling forms */
  ignoredData: string[];
}

const alternateNames: AlternateNamesConfig = {
  alternateDataNames: {
    title: ['name', 'talk title', 'título'],
    description: ['abstract', 'describe', 'summary', 'descrição'],
    organizer_notes: ['notes', 'additional', 'why accept', 'comments', 'Referências'],
    level: ['audience'],
    type: ['talk type', 'categoria'],
    slides: ['slides', 'slides url'],
    body: ['bio', 'about you', 'biography', 'speaker bio'],
  },

  alternateOptions: {
    type: {
      lightning: [],
      seminar: ['regular'],
      keynote: ['regular'],
      workshop: ['tutorial'],
    },

    level: {
      beginner: ['entry'],
      intermediate: ['mid'],
      advanced: ['advanced'],
    },
  },

  ignoredData: ['created_at', 'updated_at', 'public'],
};

export default alternateNames;
