// heroData.js - 英雄数据管理

import { fetchHeroData } from '../services/api.js';
import { getAllHeros, setAllHeros } from '../services/storage.js';

let heroData = {};
let isLoading = false;
let loadPromise = null;

/** 初始化英雄数据（异步） */
export async function initHeroData() {
    if (Object.keys(heroData).length > 0) return heroData;
    if (isLoading && loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = (async () => {
        try {
            const cached = getAllHeros();
            heroData = cached && Object.keys(cached).length > 0 ? cached : await fetchHeroData();
            if (!cached) setAllHeros(heroData);
        } catch (error) {
            console.error('加载英雄数据失败:', error);
            heroData = {};
        } finally {
            isLoading = false;
        }
        return heroData;
    })();

    return loadPromise;
}

/** 处理数据为空的错误 */
function throwEmptyError(type, value) {
    const message = type === 'id'
        ? `英雄ID "${value}" 不存在，数据需要更新`
        : `英雄名称 "${value}" 不存在，数据需要更新`;

    alert(`${message}\n即将刷新页面获取最新数据。`);
    // 清空存储的英雄数据
    setAllHeros({});
    window.location.reload();
    throw new Error(message);
}

/** 获取所有英雄 */
export function getAllHeroes() {
    return heroData;
}

/** 获取英雄信息 */
export function getHeroInfo(heroName) {
    const info = heroData[heroName];
    if (!info) throwEmptyError('name', heroName);
    return info;
}

/** 解析英雄ID和名称 */
export function parseHeroInfo(heroName) {
    const info = getHeroInfo(heroName);
    const [id, name] = info.split('|');
    return { id, name };
}

/** 根据ID获取英雄名称 */
export function getHeroNameById(heroId) {
    for (const [name, info] of Object.entries(heroData)) {
        if (info.split('|')[0] === String(heroId)) return name;
    }
    throwEmptyError('id', heroId);
}

/** 获取英雄头像URL */
export function getHeroAvatarUrl(heroName) {
    const info = getHeroInfo(heroName);
    const [id] = info.split('|');
    return `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${id}/${id}.jpg`;
}

/** 按类型筛选英雄 */
export function filterHeroesByType(type) {
    const filterValue = '|' + type;
    const filtered = {};
    for (const [name, info] of Object.entries(heroData)) {
        if (info.includes(filterValue)) filtered[name] = info;
    }
    return filtered;
}

/** 获取英雄数量 */
export function getHeroCount() {
    return Object.keys(heroData).length;
}

/** 获取各类型英雄数量 */
export function getHeroCountByType() {
    const counts = {};
    for (const info of Object.values(heroData)) {
        const parts = info.split('|');
        if (parts.length > 1) {
            const type = parts[1];
            counts[type] = (counts[type] || 0) + 1;
        }
    }
    return counts;
}

/** 将禁用ID数组转换为英雄名称字符串 */
export function parseBanHeroesFromIds(banIds) {
    if (!banIds?.length) return '';
    return banIds.map(id => getHeroNameById(String(id))).filter(Boolean).join(' ');
}

// ============ 智能禁用英雄描述 ============

export const HERO_TYPE_MAP = {
    '1': '战士',
    '2': '法师',
    '3': '坦克',
    '4': '刺客',
    '5': '射手',
    '6': '辅助'
};

/** 获取英雄按类型分组 */
function getHeroesGroupedByType() {
    const grouped = {
        '战士': new Map(),
        '法师': new Map(),
        '坦克': new Map(),
        '刺客': new Map(),
        '射手': new Map(),
        '辅助': new Map()
    };

    for (const [name, info] of Object.entries(heroData)) {
        const [id, type] = info.split('|');
        const typeName = HERO_TYPE_MAP[type];
        if (typeName && grouped[typeName]) {
            grouped[typeName].set(id, name);
        }
    }
    return grouped;
}

/** 生成按职业分组的禁用描述 */
export function getDetailedBanDescription(banIds) {
    if (!banIds?.length) return '无禁用英雄';

    // 确保所有ID都存在
    banIds.forEach(id => getHeroNameById(String(id)));

    const banSet = new Set(banIds.map(String));
    const grouped = getHeroesGroupedByType();
    const lines = [];

    for (const [typeName, heroesMap] of Object.entries(grouped)) {
        const bannedNames = [];
        const notBannedNames = [];

        for (const [id, name] of heroesMap) {
            banSet.has(id) ? bannedNames.push(name) : notBannedNames.push(name);
        }

        const totalCount = heroesMap.size;
        const bannedCount = bannedNames.length;

        if (bannedCount === 0) {
            lines.push(`【${typeName}】未禁用`);
        } else if (bannedCount === totalCount) {
            lines.push(`【${typeName}】全部禁用`);
        } else if (bannedCount > notBannedNames.length) {
            lines.push(`【${typeName}】除${notBannedNames.join('、')}外全部禁用`);
        } else {
            lines.push(`【${typeName}】禁用：${bannedNames.join('、')}`);
        }
    }

    return lines.join('\n');
}

/** 检查数据是否已加载 */
export function isDataLoaded() {
    return Object.keys(heroData).length > 0;
}

/** 强制刷新数据 */
export async function refreshHeroData() {
    heroData = {};
    isLoading = false;
    loadPromise = null;
    return await initHeroData();
}

/** 测试函数：清空英雄数据 */
export function clearHeroDataForTest() {
    heroData = {};
    isLoading = false;
    loadPromise = null;
    console.log('[heroData] 测试：英雄数据已清空');
}