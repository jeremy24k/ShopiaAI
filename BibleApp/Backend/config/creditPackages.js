export const CREDIT_PACKAGES = {
    basic: {
        id: "basic",
        name: "Basic",
        credits: 50,
        price: 4.99,
        currency: 'USD',
        description: "50 credits for $4.99"
    },
    premium: {
        id: "premium",
        name: "Premium",
        credits: 100,
        price: 9.99,
        currency: 'USD',
        description: "100 credits for $9.99"
    },
    unlimited: {
        id: "unlimited",
        name: "Unlimited",
        credits: 1000,
        price: 49.99,
        currency: 'USD',
        description: "1000 credits for $49.99"
    }
}

export const AI_COSTS = {
    // Chat normal
    message: 1,
    // Tareas especializadas (Botones)
    SimpleExplanation: 2,
    HistoricalContext: 3,
    DailyApplication: 3,
    RelatedVerses: 3,
    OriginalLanguage: 4,
    StudyPlan: 5 // Alta carga de tokens y estructura compleja
};

export const getPackageById = (packageId) => {
    return CREDIT_PACKAGES[packageId];
}