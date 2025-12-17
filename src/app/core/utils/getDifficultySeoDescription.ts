export function getDifficultySeoDescription(level: string) {
    const map: Record<string, {
        title: string;
        description: string;
        metaTitle: string;
        metaDescription: string;
        image: string;
    }> = {
        light: {
            title: 'Прості рецепти – готуй легко',
            description: 'Ідеально для новачків або коли нема часу. Мінімум дій – максимум смаку.',
            metaTitle: 'Прості рецепти – швидке та легке приготування',
            metaDescription: 'Готуйте без зайвого клопоту! Найпростіші рецепти на кожен день – смачно і без стресу.',
            image: '/assets/icon/difficultywebp'
        },
        medium: {
            title: 'Рецепти середньої складності',
            description: 'Для тих, хто вже трохи тямить у кухні. Результат вартує зусиль!',
            metaTitle: 'Рецепти середньої складності – готуй із задоволенням',
            metaDescription: 'Баланс між простотою та цікавістю – рецепти середнього рівня складності для натхнення.',
            image: 'assets/icon/difficulty/medium.webp'
        },
        hard: {
            title: 'Складні рецепти – як у ресторані',
            description: 'Серйозні кулінарні виклики для фанатів гастрономії. Твори шедеври вдома!',
            metaTitle: 'Складні рецепти – ресторанні страви вдома',
            metaDescription: 'Гурманські страви, цікаві техніки та оригінальні поєднання – для досвідчених кулінарів.',
            image: 'assets/icon/difficulty/difficult.webp'
        }
    };

    return map[level] ?? {
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        image: 'assets/icon/difficulty/default.webp'
    };
}
