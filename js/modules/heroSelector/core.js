// modules/heroSelector/core.js

import { getAllHeroes, getHeroInfo } from '../../data/heroData.js';
import { HERO_TYPE_MAP } from './constants.js';

// ============ 英雄数据获取 ============

export const getAllHeroNames = () => {
    const heroes = getAllHeroes();
    return Object.keys(heroes);
};

export const getHeroCount = () => {
    return getAllHeroNames().length;
};

// ============ 筛选逻辑 ============

export const shouldShowHeroByType = (heroName, type) => {
    if (type === 'all') return true;
    
    const heroInfo = getHeroInfo(heroName);
    const filterValue = '|' + type;
    return heroInfo.includes(filterValue);
};

export const shouldShowHeroBySearch = (heroName, keyword) => {
    if (!keyword) return true;
    return heroName.toLowerCase().includes(keyword.toLowerCase());
};

// ============ 选择逻辑 ============

export const parseHeroString = (heroStr) => {
    if (!heroStr) return [];
    return heroStr.split(/\s+/).filter(Boolean);
};

export const isHeroSelected = (heroName, selectedHeroes) => {
    return selectedHeroes.includes(heroName);
};

// ============ 配置验证 ============

export { isRandomBanConfig } from '../../utils/config/index.js'

export const isJSON = (str) => {
    if (typeof str !== 'string') return false;
    try {
        const obj = JSON.parse(str);
        return typeof obj === 'object' && obj !== null;
    } catch {
        return false;
    }
};

// ============ 类型统计 ============

export const getHeroTypeStats = () => {
    const heroes = getAllHeroes();
    const heroNames = Object.keys(heroes);
    const typeMap = {};
    
    heroNames.forEach(name => {
        const info = getHeroInfo(name);
        const parts = info.split('|');
        if (parts.length > 1) {
            const type = parts[1];
            if (!typeMap[type]) {
                typeMap[type] = { count: 0, heroes: [], name: HERO_TYPE_MAP[type] || type };
            }
            typeMap[type].count++;
            typeMap[type].heroes.push(name);
        }
    });
    
    return typeMap;
};

export const getAvailableHeroesByTypes = (selectedTypes) => {
    const heroes = getAllHeroes();
    const heroNames = Object.keys(heroes);
    const availableHeroes = new Set();
    
    selectedTypes.forEach(type => {
        const filterValue = '|' + type;
        heroNames.forEach(name => {
            if (getHeroInfo(name).includes(filterValue)) {
                availableHeroes.add(name);
            }
        });
    });
    
    return Array.from(availableHeroes);
};

// ============ 配置名生成 ============

export const generateDefaultConfigName = (heroCount) => {
    return `禁用${heroCount}个英雄`;
};

export const generateRandomConfigName = (count, typeNameStr) => {
    return `随机禁${count}个[${typeNameStr}]`;
};

export const generateRandomConfigValue = (count, selectedTypes) => {
    return `随机|${count}|${selectedTypes.join(',')}`;
};