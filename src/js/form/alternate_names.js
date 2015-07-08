module.exports = {

    alternateDataNames: {
        title: ['name', 'talk title'],
        description: ['abstract', 'describe'],
        organizer_notes: ['notes', 'additional', 'why accept', 'comments'],
        level: ['audience'],
        type: ['talk type']
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