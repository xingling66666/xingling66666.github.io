// utils/config/constants.js

import { lastCustomVersion } from "../../config/constants.js";
import { getAllHeros } from '../../services/storage.js';
import { isRandomBanConfig } from "./validator.js";

// ============ 游戏配置元数据 ============

/**
 * 配置数据结构说明：
 * 
 * 1. 英雄属性
 *    - totalCount = 10（蓝方5个位置 + 红方5个位置）
 *    - ids[side] 为数组，长度 = 5（每个玩家位置一个ID）
 *    - CD特殊：ids[side] 长度为10，每两个ID对应一个位置（ids[position] 和 ids[position+5]）
 * 
 * 2. 兵线属性 / 野怪属性 / 水晶属性
 *    - totalCount = 2（蓝方1个 + 红方1个）
 *    - ids[side] 为单个数字，所有选项共用
 * 
 * 3. 防御塔属性
 *    - totalCount = 2（蓝方1组 + 红方1组）
 *    - ids[side] 为数组，长度 = options.length
 * 
 * 4. 特殊规则：
 *    - 所有属性默认值为 0
 *    - 出兵路线：值 7 为网页默认值（游戏内无对应ID）
 */

// ============ 英雄属性 ============

export const HERO_ATTRIBUTES = {
    exp: {
        label: '初始等级',
        options: ['1级', '4级', '5级', '8级', '10级', '12级', '15级'],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [0, 51, 56, 61, 66],
            red: [28, 71, 76, 81, 86]
        }
    },

    magic: {
        label: '法术攻击加成',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [1, 52, 57, 62, 67],
            red: [29, 72, 77, 82, 87]
        }
    },

    physical: {
        label: '物理攻击加成',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [2, 53, 58, 63, 68],
            red: [30, 73, 78, 83, 88]
        }
    },

    cd: {
        label: '冷却缩减',
        options: ['无加成', '减25%', '减40%', '减80%', '减99%'],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [3, 54, 59, 64, 69, 21, 91, 92, 93, 94],
            red: [31, 74, 79, 84, 89, 47, 95, 96, 97, 98]
        }
    },

    gold: {
        label: '初始金币',
        options: ['无加成', '1000', '2000', '5000', '12000', "20000"],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [4, 55, 60, 65, 70],
            red: [32, 75, 80, 85, 90]
        }
    },

    speed: {
        label: '移动速度',
        options: ['无加成', '加10%', '加20%', '加30%'],
        defaultValue: 0,
        totalCount: 10,
        ids: {
            blue: [106, 107, 108, 109, 110],
            red: [111, 112, 113, 114, 115]
        }
    }
};

// ============ 兵线属性 ============

export const MINION_ATTRIBUTES = {
    attack: {
        label: '攻击力',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 5, red: 33 }
    },

    hp: {
        label: '生命值',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 6, red: 34 }
    },

    speed: {
        label: '移动速度',
        options: ['无加成', '加25%', '加50%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 7, red: 35 }
    },

    respawnSpeed: {
        label: '刷新速度',
        options: ['无加成', '加5%', '加10%', '加15%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 8, red: 36 }
    },

    type: {
        label: '出兵类型',
        options: ['普通兵线', '超级兵', '主宰先锋'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 9, red: 37 }
    },

    route: {
        label: '出兵路线',
        options: ['不出兵', '对抗路', '中路', '对抗路 中路', '发育路', '对抗路 发育路', '中路 发育路', '对抗路 中路 发育路'],
        defaultValue: 7,
        totalCount: 2,
        ids: { blue: 10, red: 38 }
    }
};

// ============ 野怪属性 ============

export const MONSTER_ATTRIBUTES = {
    attack: {
        label: '攻击力',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 11, red: 39 }
    },

    hp: {
        label: '生命值',
        options: ['无加成', '加10%', '加25%', '加50%', '加75%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 12, red: 40 }
    }
};

// ============ 防御塔属性 ============

export const TOWER_ATTRIBUTES = {
    attack: {
        label: '攻击力',
        options: ['无加成', '加25%', '加50%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: [13, 22], red: [41, 48] }
    },

    range: {
        label: '攻击范围',
        options: ['无加成', '加25%', '加50%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: [15, 24], red: [43, 50] }
    },

    hp: {
        label: '生命值',
        options: ['无加成', '加25%', '加50%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: [14, 23], red: [42, 49] }
    }
};

// ============ 水晶属性 ============

export const CRYSTAL_ATTRIBUTES = {
    attack: {
        label: '攻击力',
        options: ['无加成', '加25%', '加50%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 16, red: 44 }
    },

    hp: {
        label: '生命值',
        options: ['无加成', '加25%', '加50%', '加100%'],
        defaultValue: 0,
        totalCount: 2,
        ids: { blue: 17, red: 45 }
    }
};

// ============ 所有属性集合 ============

export const ALL_ATTRIBUTES = {
    hero: HERO_ATTRIBUTES,
    minion: MINION_ATTRIBUTES,
    monster: MONSTER_ATTRIBUTES,
    tower: TOWER_ATTRIBUTES,
    crystal: CRYSTAL_ATTRIBUTES
};

// ============ UI 分组结构 ============
// 修改 tabKey 需同步更新 parser.js 中 parseGameDataToConfig 函数的 PARSER_MAP
export const UI_SECTIONS = [
    {
        name: '英雄属性',
        tabKey: 'hero',
        category: 'hero',
        attributes: HERO_ATTRIBUTES,
        order: ['exp', 'magic', 'physical', 'cd', 'gold', 'speed']
    },
    {
        name: '兵线与野怪',
        tabKey: 'minionAndMonster',
        groups: [
            {
                name: '兵线属性',
                category: 'minion',
                attributes: MINION_ATTRIBUTES,
                order: ['attack', 'hp', 'speed', 'respawnSpeed', 'type', 'route']
            },
            {
                name: '野怪属性',
                category: 'monster',
                attributes: MONSTER_ATTRIBUTES,
                order: ['attack', 'hp']
            }
        ]
    },
    {
        name: '防御塔与水晶',
        tabKey: 'towerAndCrystal',
        groups: [
            {
                name: '防御塔属性',
                category: 'tower',
                attributes: TOWER_ATTRIBUTES,
                order: ['attack', 'range', 'hp']
            },
            {
                name: '水晶属性',
                category: 'crystal',
                attributes: CRYSTAL_ATTRIBUTES,
                order: ['attack', 'hp']
            }
        ]
    }
];

// 导出 TAB_KEYS
export const TAB_KEYS = UI_SECTIONS.map(s => s.tabKey);
// 胜利条件选择框 ID
export const VICTORY_SELECT_ID = 'victory-condition';

// ============ 扁平化高级配置 ============

export const FLAT_CONFIG = (() => {
    const flat = {};

    Object.entries(ALL_ATTRIBUTES).forEach(([category, attributes]) => {
        Object.entries(attributes).forEach(([attrKey, attr]) => {
            const id = `${category}.${attrKey}`;
            const positionCount = attr.totalCount === 10 ? 5 : 1;

            flat[id] = {
                id,
                category,
                attrKey,
                label: attr.label,
                options: attr.options,
                totalCount: attr.totalCount,
                positions: [...Array(positionCount).keys()],
                values: [...Array(attr.options.length).keys()]
            };
        });
    });

    return flat;
})();

// ============ 胜利条件 ============

export const VICTORY_CONDITIONS = [
    { value: 0, label: '摧毁水晶', config: {} },
    { value: 1, label: '摧毁任意一个一塔', config: { 19: 1 } },
    { value: 2, label: '摧毁任意一个二塔', config: { 19: 1, 103: 1 } },
    { value: 3, label: '摧毁任意一个三塔', config: { 19: 1, 103: 2 } },
    { value: 4, label: '3个总击败', config: { 19: 2 } },
    { value: 5, label: '20个总击败', config: { 19: 2, 20: 1 } },
    { value: 6, label: '30个总击败', config: { 19: 2, 20: 2 } },
    { value: 7, label: '40个总击败', config: { 19: 2, 20: 3 } },
    { value: 8, label: '1个助攻', config: { 19: 2, 105: 1 } },
    { value: 9, label: '5个助攻', config: { 19: 2, 105: 1, 104: 1 } },
    { value: 10, label: '10个助攻', config: { 19: 2, 105: 1, 104: 2 } }
];

export const DEFAULT_VICTORY = 0;

// ============ 特殊常量 ============

export const DEFAULT_VALUE = 0;
export const ROUTE_WEB_DEFAULT = 7;

// ============ 工具函数 ============
export const getFlatConfigKeys = () => Object.keys(FLAT_CONFIG);
export const getFlatConfig = (id) => FLAT_CONFIG[id];

export const getGameIds = (attr, side, position = 0) => {
    if (!attr) return [];

    const ids = attr.ids[side];

    // CD特殊：返回该位置的两个ID
    if (attr === HERO_ATTRIBUTES.cd) {
        return [ids[position], ids[position + 5]];
    }

    // 英雄属性：返回该位置的ID
    if (attr.totalCount === 10) {
        return [ids[position]];
    }

    // 防御塔：返回整个数组
    if (Array.isArray(ids)) {
        return ids;
    }

    // 兵线/野怪/水晶：包装成数组
    return [ids];
};

export const getDefaultValueByKey = (attrKey) => {
    // 路线属性7是默认值，其他属性0是默认值
    return attrKey === 'route' ? ROUTE_WEB_DEFAULT : DEFAULT_VALUE;
};

export const getDefaultValueById = (gameId) => {
    // 路线属性7是默认值，其他属性0是默认值
    const isRouteId =
        gameId === MINION_ATTRIBUTES.route.ids.blue ||
        gameId === MINION_ATTRIBUTES.route.ids.red;

    return isRouteId ? ROUTE_WEB_DEFAULT : DEFAULT_VALUE;
};

export const isDefaultValueByKey = (attrKey, value) => {
    if (value === undefined || value === null || isNaN(value)) {
        return true;
    }
    const numValue = parseInt(value, 10);
    return numValue === getDefaultValueByKey(attrKey);
};

export const isDefaultValueById = (gameId, value) => {
    if (value === undefined || value === null || isNaN(value)) {
        return true;
    }
    const numValue = parseInt(value, 10);
    return numValue === getDefaultValueById(gameId);
};

export const isEffectiveValueByKey = (attrKey, value) => {
    return !isDefaultValueByKey(attrKey, value);
};

export const isEffectiveValueById = (gameId, value) => {
    return !isDefaultValueById(gameId, value);
};

export const getVictoryConfig = (value) => {
    const condition = VICTORY_CONDITIONS.find(c => c.value === value);
    return condition?.config || {};
};

export const getVictoryLabel = (value) => {
    const condition = VICTORY_CONDITIONS.find(c => c.value === value);
    return condition?.label || VICTORY_CONDITIONS[0].label;
};

// 根据分类获取属性集合
export const getAttributesByCategory = (category) => {
    return ALL_ATTRIBUTES[category] || null;
};

// 获取属性（通过 category 和 attrKey）
export const getAttribute = (category, attrKey) => {
    return getAttributesByCategory(category)?.[attrKey];
};

// 通过 ID 获取属性
export const getAttributeById = (id) => {
    const [category, attrKey] = id.split('.');
    return getAttribute(category, attrKey);
};

// 根据属性集合反向获取分类名
export const getCategoryByAttributes = (attributes) => {
    for (const [category, attrs] of Object.entries(ALL_ATTRIBUTES)) {
        if (attrs === attributes) {
            return category;
        }
    }
    return null;
};

// ============ 扁平化 Key 辅助函数 ============

// 解析扁平化 key
export const parseFlatKey = (flatKey) => {
    const parts = flatKey.split('.');
    if (parts.length === 2) {
        return { category: parts[0], attrKey: parts[1] };
    }
    return null;
};

// 构建扁平化 key
export const buildFlatKey = (category, attrKey) => {
    return `${category}.${attrKey}`;
};

// 从扁平化 key 中提取属性 key
export const extractAttrKey = (flatKey) => {
    const parts = flatKey.split('.');
    return parts.length === 2 ? parts[1] : flatKey;
};

// 从扁平化 key 中提取分类
export const extractCategory = (flatKey) => {
    const parts = flatKey.split('.');
    return parts.length === 2 ? parts[0] : null;
};

// 判断值是否为默认值（使用扁平化 key）
export const isDefaultValueByFlatKey = (flatKey, value) => {
    const parsed = parseFlatKey(flatKey);
    if (!parsed) return true;
    return isDefaultValueByKey(parsed.attrKey, value);
};

// 判断值是否为有效值（非默认值，使用扁平化 key）
export const isEffectiveValueByFlatKey = (flatKey, value) => {
    return !isDefaultValueByFlatKey(flatKey, value);
};

// ============ 配置构建 ============

/**
 * 构建完整的配置对象
 */
export const buildFullConfig = (uiConfig, advancedData = {}, meta = {}) => {
    return {
        ...uiConfig,
        advanced: {
            mapID: advancedData.mapID || '',
            heroBans: advancedData.heroBans || '',
            randomGen: advancedData.randomGen || {},
            randomShuffle: advancedData.randomShuffle || {}
        },
        version: lastCustomVersion,
        name: meta.name || '未命名',
        createdAt: meta.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

// ============ 从保存配置中解析禁用英雄ID列表 ============

/**
 * 从保存的配置字符串中解析禁用英雄ID列表
 * 支持两种格式：
 * 1. 普通格式：英雄ID以空格分隔，如 "105 106 107"
 * 2. 随机格式：random|数量|关键词，如 "random|5|马,龙"
 * 
 * @param {string} heroSetting - 保存的配置字符串
 * @param {Object} heroData - 英雄数据对象（可选）
 * @returns {string[]} 禁用英雄ID数组
 */
export function parseBanIdsFromConfig(heroSetting, heroData = null) {
    if (!heroSetting) return [];

    const data = heroData || getAllHeros();
    if (!data) return [];

    if (isRandomBanConfig(heroSetting)) {
        const parts = heroSetting.split('|');
        const banCount = parseInt(parts[1], 10) || 5;
        const keywords = parts[2]?.split(',').filter(Boolean) || [];

        let candidates = Object.entries(data);

        if (keywords.length > 0) {
            candidates = candidates.filter(([_, name]) =>
                keywords.some(keyword => name.includes(keyword))
            );
        }

        return candidates
            .sort(() => Math.random() - 0.5)
            .slice(0, banCount)
            .map(([id]) => id);
    }

    // 从保存的配置中解析固定的英雄ID列表
    return heroSetting
        .split(/\s+/)
        .filter(id => id && data[id])
        .map(id => data[id].split('|')[0]);
}