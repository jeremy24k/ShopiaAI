export const CREDIT_PACKAGES = {
    starter: {
        id: "STARTER",
        name: "starter",
        credits: 20,
        price: 1.99,
        currency: 'USD',
        description: "20 credits for $1.99 — perfect to get started",
        popular: false,
    },
    basic: {
        id: "BASIC",
        name: "basic",
        credits: 50,
        price: 4.99,
        currency: 'USD',
        description: "50 credits for $4.99",
        popular: false,
    },
    premium: {
        id: "PREMIUM",
        name: "premium",
        credits: 100,
        price: 9.99,
        currency: 'USD',
        description: "100 credits for $9.99",
        popular: true,
    },
    unlimited: {
        id: "UNLIMITED",
        name: "unlimited",
        credits: 1000,
        price: 29.99,
        currency: 'USD',
        description: "1000 credits for $29.99 — best value, save 70%",
        popular: false,
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
    if (!packageId) return undefined;
    return CREDIT_PACKAGES[packageId.toLowerCase()];
}