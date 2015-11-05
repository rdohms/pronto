export default {

    alternateDataNames: {
        title: ['name', 'talk title', 'título'],
        description: ['abstract', 'describe', 'summary', 'descrição'],
        organizer_notes: ['notes', 'additional', 'why accept', 'comments', 'Referências'],
        level: ['audience'],
        type: ['talk type', 'categoria'],
        slides: ['slides', 'slides url'],
        body: ['bio', 'about you', 'biography', 'speaker bio']
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
