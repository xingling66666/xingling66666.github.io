// utils/config/converter.js

import {
    HERO_ATTRIBUTES,
    MINION_ATTRIBUTES,
    MONSTER_ATTRIBUTES,
    TOWER_ATTRIBUTES,
    CRYSTAL_ATTRIBUTES,
    VICTORY_CONDITIONS,
    isEffectiveValueByKey,
    isEffectiveValueById,
    getGameIds,
    getAttribute,
    FLAT_CONFIG
} from './constants.js';
import { shufflePositions } from '../random.js';

// ============ 配置转 SMOBA 格式 ============

export function configToCustomItems(config, playerCount) {
    let items = [];

    if (config.hero?.data) {
        processHeroData(items, config.hero, playerCount);
    }

    if (config.minion?.data) {
        processMinionData(items, config.minion);
    }

    if (config.tower?.data) {
        processTowerData(items, config.tower);
    }

    if (config.victory && config.victory !== String(0)) {
        const victoryCondition = VICTORY_CONDITIONS.find(c => c.value === parseInt(config.victory));
        if (victoryCondition?.config) {
            Object.entries(victoryCondition.config).forEach(([id, value]) => {
                items.push(`${id}:${value}`);
            });
        }
    }

    if (config.advanced?.randomGen) {
        items = applyRandomGenToItems(items, config.advanced.randomGen, playerCount);
    }

    if (config.advanced?.randomShuffle) {
        items = applyRandomShuffleToItems(items, config.advanced.randomShuffle, playerCount);
    }

    return items.filter(item => {
        const [id, value] = item.split(':');
        return isEffectiveValueById(parseInt(id), parseInt(value));
    });
}

// ============ 随机规则处理 ============

/**
 * 获取指定字段的标识符列表
 * 普通属性返回 [[id1], [id2], ...]，CD 属性返回 [[id1,id2], [id3,id4], ...]
 * 统一抽象后，取值取每组第一个，设值遍历整组
 * @param {string} category - 分类: 'hero' | 'minion' | 'monster' | 'tower' | 'crystal'
 * @param {string} attrKey - 属性key
 * @param {number} playerCount - 每队玩家数量
 * @returns {Array<Array<string>>} 标识符分组数组
 */
function getFieldIdentifiers(category, attrKey, playerCount) {
    const attr = getAttribute(category, attrKey);
    if (!attr) return [];

    const identifiers = [];
    const positionCount = attr.totalCount === 10 ? playerCount : 1;

    for (let pos = 0; pos < positionCount; pos++) {
        // 蓝方
        const blueIds = getGameIds(attr, 'blue', pos);
        identifiers.push(blueIds.map(String));

        // 红方
        const redIds = getGameIds(attr, 'red', pos);
        identifiers.push(redIds.map(String));
    }

    return identifiers;
}

/**
 * 从 itemMap 中获取指定位置的值
 * @param {Map<string, string>} itemMap - ID 到值的映射
 * @param {Array<Array<string>>} identifiers - 标识符分组数组
 * @param {Array<number>} positions - 要获取的位置索引
 * @returns {Array<string>} 对应位置的值（过滤掉不存在的）
 */
function getValuesFromIdentifiers(itemMap, identifiers, positions) {
    return positions
        .map(pos => pos < identifiers.length ? itemMap.get(identifiers[pos][0]) : null)
        .filter(v => v !== undefined && v !== null);
}

/**
 * 设置值到 itemMap 的指定位置
 * @param {Map<string, string>} itemMap - ID 到值的映射
 * @param {Array<Array<string>>} identifiers - 标识符分组数组
 * @param {Array<number>} positions - 要设置的位置索引
 * @param {Array<string>} values - 要设置的值
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
 * 根据规则中的 range 为指定位置随机生成值
 */
function applyRandomGenToItems(items, randomGen, playerCount) {
    const itemMap = new Map();
    items.forEach(item => {
        const [id, value] = item.split(':');
        itemMap.set(id, value);
    });

    for (const [id, rules] of Object.entries(randomGen)) {
        if (!Array.isArray(rules)) continue;

        // 从 FLAT_CONFIG 获取元数据
        const flatMeta = FLAT_CONFIG[id];
        if (!flatMeta) continue;

        const { category, attrKey } = flatMeta;
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
 * 根据规则中的 positions 将指定位置的值随机打乱
 */
function applyRandomShuffleToItems(items, randomShuffle, playerCount) {
    const itemMap = new Map();
    items.forEach(item => {
        const [id, value] = item.split(':');
        itemMap.set(id, value);
    });

    for (const [id, rules] of Object.entries(randomShuffle)) {
        if (!Array.isArray(rules)) continue;

        // 从 FLAT_CONFIG 获取元数据
        const flatMeta = FLAT_CONFIG[id];
        if (!flatMeta) continue;

        const { category, attrKey } = flatMeta;
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

// ============ 英雄属性处理 ============

function processHeroData(items, heroConfig, playerCount) {
    const { mode, data } = heroConfig;

    const processValue = (side, attrKey, value, pos) => {
        if (isEffectiveValueByKey(attrKey, value)) {
            addHeroValueToSide(items, side, attrKey, value, pos);
        }
    };

    if (mode === 'all') {
        Object.entries(data).forEach(([attrKey, value]) => {
            for (let pos = 0; pos < playerCount; pos++) {
                processValue('blue', attrKey, value, pos);
                processValue('red', attrKey, value, pos);
            }
        });
    } else if (mode === 'team') {
        ['blue', 'red'].forEach(side => {
            const sideData = data[side];
            if (sideData) {
                Object.entries(sideData).forEach(([attrKey, value]) => {
                    for (let pos = 0; pos < playerCount; pos++) {
                        processValue(side, attrKey, value, pos);
                    }
                });
            }
        });
    } else if (mode === 'player') {
        ['blue', 'red'].forEach(side => {
            const players = data[side];
            if (players) {
                players.forEach((playerAttrs, pos) => {
                    if (pos >= playerCount) return;
                    Object.entries(playerAttrs).forEach(([attrKey, value]) => {
                        processValue(side, attrKey, value, pos);
                    });
                });
            }
        });
    }
}

function addHeroValueToSide(items, side, attrKey, value, position) {
    const attr = HERO_ATTRIBUTES[attrKey];
    if (!attr) return;

    const gameIds = getGameIds(attr, side, position);
    gameIds.forEach(id => items.push(`${id}:${value}`));
}

// ============ 兵线属性处理 ============

function processMinionData(items, minionConfig) {
    const { mode, data } = minionConfig;

    if (mode === 'all') {
        processMinionSide(items, 'blue', data);
        processMinionSide(items, 'red', data);
    } else if (mode === 'team') {
        if (data.blue) processMinionSide(items, 'blue', data.blue);
        if (data.red) processMinionSide(items, 'red', data.red);
    }
}

function processMinionSide(items, side, sideData) {
    // 处理兵线属性
    Object.entries(MINION_ATTRIBUTES).forEach(([attrKey, attr]) => {
        const value = sideData[attrKey];
        if (isEffectiveValueByKey(attrKey, value)) {
            const gameIds = getGameIds(attr, side);
            gameIds.forEach(id => items.push(`${id}:${value}`));
        }
    });
    
    // 处理野怪属性
    Object.entries(MONSTER_ATTRIBUTES).forEach(([attrKey, attr]) => {
        const value = sideData[attrKey];
        if (isEffectiveValueByKey(attrKey, value)) {
            const gameIds = getGameIds(attr, side);
            gameIds.forEach(id => items.push(`${id}:${value}`));
        }
    });
}

// ============ 防御塔属性处理 ============

function processTowerData(items, towerConfig) {
    const { mode, data } = towerConfig;

    if (mode === 'all') {
        processTowerSide(items, 'blue', data);
        processTowerSide(items, 'red', data);
    } else if (mode === 'team') {
        if (data.blue) processTowerSide(items, 'blue', data.blue);
        if (data.red) processTowerSide(items, 'red', data.red);
    }
}

function processTowerSide(items, side, sideData) {
    // 处理防御塔属性
    Object.entries(TOWER_ATTRIBUTES).forEach(([attrKey, attr]) => {
        const value = sideData[attrKey];
        if (isEffectiveValueByKey(attrKey, value)) {
            const gameIds = getGameIds(attr, side);
            gameIds.forEach(id => items.push(`${id}:${value}`));
        }
    });
    
    // 处理水晶属性
    Object.entries(CRYSTAL_ATTRIBUTES).forEach(([attrKey, attr]) => {
        const value = sideData[attrKey];
        if (isEffectiveValueByKey(attrKey, value)) {
            const gameIds = getGameIds(attr, side);
            gameIds.forEach(id => items.push(`${id}:${value}`));
        }
    });
}