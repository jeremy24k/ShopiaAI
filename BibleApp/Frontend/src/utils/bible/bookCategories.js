export const getBookCategories = (t) => [
    { value: "all", label: t('all') || "All" },
    { value: "pentateuco", label: t('pentateuco') || "Pentateuco" },
    { value: "historicos", label: t('historico') || "Históricos" },
    { value: "poeticos", label: t('poetico') || "Poéticos" },
    { value: "profetas_mayores", label: t('profeta_mayor') || "Profetas Mayores" },
    { value: "profetas_menores", label: t('profeta_menor') || "Profetas Menores" },
    { value: "evangelios", label: t('evangelio') || "Evangelios" },
    { value: "cartas_de_pablo", label: t('cartas_pablo') || "Cartas de Pablo" },
    { value: "cartas_universales", label: t('cartas_universales') || "Cartas Universales" },
    { value: "profeticos", label: t('profeticos') || "Proféticos" },
    { value: "hechos", label: t('hechos') || "Hechos" },
    { value: "libros_apocrifos", label: t('apocrifos') || "Libros Apócrifos" },
];

