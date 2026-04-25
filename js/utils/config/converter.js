// utils/config/converter.js

import {
    DEFAULT_VALUE,
    VICTORY_CONDITIONS,
    isEffectiveValueByKey,
    isEffectiveValueById,
    getGameIds,
    getAttribute,
    UI_SECTIONS,
    parseFlatKey
} from './constants.js';
import { shufflePositions } from '../random.js';

// ============ 配置转 SMOBA 格式 ============

export function configToCustomItems(config, playerCount) {
    let items = [];

    // 遍历所有 UI 分组
    UI_SECTIONS.forEach(section => {
        const sectionConfig = config[section.tabKey];
        if (!sectionConfig?.data) return;

        const { mode, data } = sectionConfig;

        // 处理有 groups 的 section（兵线与野怪、防御塔与水晶）
        if (section.groups) {
            section.groups.forEach(group => {
                processGroup(items, group, mode, data, playerCount);
            });
        }
        // 处理直接有 attributes 的 section（英雄属性）
        else if (section.attributes) {
            processSection(items, section, mode, data, playerCount);
        }
    });

    // 处理胜利条件
    if (config.victory != null && Number(config.victory) !== DEFAULT_VALUE) {
        const victoryCondition = VICTORY_CONDITIONS.find(c => c.value === parseInt(config.victory));
        if (victoryCondition?.config) {
            Object.entries(victoryCondition.config).forEach(([id, value]) => {
                items.push(`${id}:${value}`);
            });
        }
    }

    // 应用随机规则
    if (config.advanced?.randomGen) {
        items = applyRandomGenToItems(items, config.advanced.randomGen, playerCount);
    }

    if (config.advanced?.randomShuffle) {
        items = applyRandomShuffleToItems(items, config.advanced.randomShuffle, playerCount);
    }

    // 过滤默认值
    return items.filter(item => {
        const [id, value] = item.split(':');
        return isEffectiveValueById(parseInt(id), parseInt(value));
    });
}

/**
 * 处理 Section（英雄属性）
 */
function processSection(items, section, mode, data, playerCount) {
    const { category, order } = section;
    const prefix = `${category}.`;

    if (mode === 'all') {
        // 全局模式：所有玩家使用相同值
        ['blue', 'red'].forEach(side => {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, side, value, playerCount);
                }
            });
        });
    }
    else if (mode === 'team') {
        // 队伍模式：蓝红方可能不同
        if (data.blue) {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data.blue[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, 'blue', value, playerCount);
                }
            });
        }
        if (data.red) {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data.red[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, 'red', value, playerCount);
                }
            });
        }
    }
    else if (mode === 'player') {
        // 玩家模式：每个位置单独配置
        ['blue', 'red'].forEach(side => {
            const players = data[side];
            if (Array.isArray(players)) {
                players.forEach((playerData, pos) => {
                    if (pos >= playerCount) return;
                    order.forEach(attrKey => {
                        const flatKey = `${prefix}${attrKey}`;
                        const value = playerData?.[flatKey];
                        if (isEffectiveValueByKey(attrKey, value)) {
                            addAttributeValuesAtPosition(items, category, attrKey, side, value, pos);
                        }
                    });
                });
            }
        });
    }
}

/**
 * 处理 Group（兵线/野怪 或 防御塔/水晶）
 */
function processGroup(items, group, mode, data, playerCount) {
    const { category, order } = group;
    const prefix = `${category}.`;

    if (mode === 'all') {
        ['blue', 'red'].forEach(side => {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, side, value, playerCount);
                }
            });
        });
    }
    else if (mode === 'team') {
        if (data.blue) {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data.blue[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, 'blue', value, playerCount);
                }
            });
        }
        if (data.red) {
            order.forEach(attrKey => {
                const flatKey = `${prefix}${attrKey}`;
                const value = data.red[flatKey];
                if (isEffectiveValueByKey(attrKey, value)) {
                    addAttributeValues(items, category, attrKey, 'red', value, playerCount);
                }
            });
        }
    }
}

/**
 * 添加属性值到 items（应用到所有位置）
 */
function addAttributeValues(items, category, attrKey, side, value, playerCount) {
    const attr = getAttribute(category, attrKey);
    if (!attr) return;

    const positionCount = attr.totalCount === 10 ? playerCount : 1;

    for (let pos = 0; pos < positionCount; pos++) {
        const gameIds = getGameIds(attr, side, pos);
        gameIds.forEach(id => items.push(`${id}:${value}`));
    }
}

/**
 * 添加属性值到 items（应用到指定位置）
 */
function addAttributeValuesAtPosition(items, category, attrKey, side, value, position) {
    const attr = getAttribute(category, attrKey);
    if (!attr) return;

    const gameIds = getGameIds(attr, side, position);
    gameIds.forEach(id => items.push(`${id}:${value}`));
}

// ============ 随机规则处理 ============

/**
 * 获取指定字段的标识符列表
 */
function getFieldIdentifiers(category, attrKey, playerCount) {
    const attr = getAttribute(category, attrKey);
    if (!attr) return [];

    const identifiers = [];
    const positionCount = attr.totalCount === 10 ? playerCount : 1;

    for (let pos = 0; pos < positionCount; pos++) {
        const blueIds = getGameIds(attr, 'blue', pos);
        identifiers.push(blueIds.map(String));
        const redIds = getGameIds(attr, 'red', pos);
        identifiers.push(redIds.map(String));
    }

    return identifiers;
}

/**
 * 从 itemMap 中获取指定位置的值
 */
function getValuesFromIdentifiers(itemMap, identifiers, positions) {
    return positions
        .map(pos => pos < identifiers.length ? itemMap.get(identifiers[pos][0]) : null)
        .filter(v => v !== undefined && v !== null);
}

/**
 * 设置值到 itemMap 的指定位置
 */
function setValuesToIdentifiers(itemMap, identifiers, positions, values) {
    positions.forEach((pos, i) => {
        if (pos < identifiers.length && i < values.length) {
            identifiers[pos].forEach(id => {
                itemMap.set(id, values[i]);
            });
        }
    });
}

/**
 * 应用随机生成规则到 items
 */
function applyRandomGenToItems(items, randomGen, playerCount) {
    const itemMap = new Map();
    items.forEach(item => {
        const [id, value] = item.split(':');
        itemMap.set(id, value);
    });

    for (const [flatId, rules] of Object.entries(randomGen)) {
        if (!Array.isArray(rules)) continue;

        const parsed = parseFlatKey(flatId);
        if (!parsed) continue;

        const { category, attrKey } = parsed;
        const identifiers = getFieldIdentifiers(category, attrKey, playerCount);

        rules.forEach(({ range, positions }) => {
            if (!range?.length || !positions?.length) return;

            const values = positions.map(pos => {
                if (pos < identifiers.length) {
                    return String(range[Math.floor(Math.random() * range.length)]);
                }
                return null;
            }).filter(v => v !== null);

            setValuesToIdentifiers(itemMap, identifiers, positions, values);
        });
    }

    return Array.from(itemMap, ([id, value]) => `${id}:${value}`);
}

/**
 * 应用随机打乱规则到 items
 */
function applyRandomShuffleToItems(items, randomShuffle, playerCount) {
    const itemMap = new Map();
    items.forEach(item => {
        const [id, value] = item.split(':');
        itemMap.set(id, value);
    });

    for (const [flatId, rules] of Object.entries(randomShuffle)) {
        if (!Array.isArray(rules)) continue;

        const parsed = parseFlatKey(flatId);
        if (!parsed) continue;

        const { category, attrKey } = parsed;
        const identifiers = getFieldIdentifiers(category, attrKey, playerCount);

        rules.forEach(positions => {
            if (!positions || positions.length < 2) return;

            const values = getValuesFromIdentifiers(itemMap, identifiers, positions);
            const shuffled = shufflePositions(values, positions);

            setValuesToIdentifiers(itemMap, identifiers, positions, shuffled);
        });
    }

    return Array.from(itemMap, ([id, value]) => `${id}:${value}`);
}