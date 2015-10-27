export default {

    alternateDataNames: {
        title: ['name', 'talk title'],
        description: ['abstract', 'describe', 'summary'],
        organizer_notes: ['notes', 'additional', 'why accept', 'comments'],
        level: ['audience'],
        slides: ['slides', 'slides url'],
        type: ['talk type'],
        body: ['bio', 'about you', 'biography']
    },

    alternateOptions: {
        type: {
            lightning: [],
            seminar: ['regular'],
            keynote: ['regular'],
            workshop: ['tutorial']
        },

        level: {
            beginner: ['entry'],
            intermediate: ['mid'],
            advanced: ['advanced']
        }
    },

    ignoredData: ['created_at', 'updated_at']

};
