// utils/config/parser.js

import {
    HERO_ATTRIBUTES,
    MINION_ATTRIBUTES,
    MONSTER_ATTRIBUTES,
    TOWER_ATTRIBUTES,
    CRYSTAL_ATTRIBUTES,
    VICTORY_CONDITIONS,
    getGameIds,
    getDefaultValueByKey,
    DEFAULT_VICTORY,
    UI_SECTIONS,
    buildFullConfig
} from './constants.js';
import * as heroData from '../../data/heroData.js';
import { compressConfig } from './compressor.js';

// ============ 辅助函数 ============

const deepEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
};

const formatAttrs = (attrs) => {
    return Object.entries(attrs)
        .map(([key, value]) => `${key}·${value}`)
        .join(' ');
};

// ============ 游戏数据转可视文本 ============

export function parseGameDataToText(gameData) {
    try {
        if (!gameData) return '无游戏数据';

        return customItemsToText(
            gameData.customDefineItems || [],
            parseInt(gameData.teamerNum) / 2 || 5
        );
    } catch (error) {
        console.error('解析游戏数据失败:', error);
        return '解析配置失败: ' + error.message;
    }
}

export function customItemsToText(items, playerCount = 5) {
    if (!items || items.length === 0) return '无自定义配置';

    const itemMap = new Map();
    items.forEach(item => {
        const [id, value] = item.split(':');
        itemMap.set(id, value);
    });

    const sections = [
        { name: '英雄属性', parser: () => parseHeroItems(itemMap, playerCount) },
        { name: '兵线属性', parser: () => parseCategoryItems(itemMap, MINION_ATTRIBUTES) },
        { name: '野怪属性', parser: () => parseCategoryItems(itemMap, MONSTER_ATTRIBUTES) },
        { name: '防御塔属性', parser: () => parseTowerItems(itemMap) },
        { name: '水晶属性', parser: () => parseCategoryItems(itemMap, CRYSTAL_ATTRIBUTES) },
        { name: '胜利条件', parser: () => parseVictoryItems(itemMap) }
    ];

    const lines = [];
    sections.forEach(({ name, parser }) => {
        const text = parser();
        if (text) lines.push(`${name}配置\n${text}`);
    });

    return lines.join('\n\n');
}

// ============ 通用分类解析 ============

function parseCategoryItems(itemMap, attributes) {
    const result = { blue: {}, red: {} };

    ['blue', 'red'].forEach(side => {
        Object.entries(attributes).forEach(([attrKey, attr]) => {
            const gameIds = getGameIds(attr, side);
            // 取第一个 ID 的值（所有 ID 的值应该相同）
            const value = itemMap.get(String(gameIds[0]));

            if (value !== undefined) {
                result[side][attr.label] = attr.options[parseInt(value)] || value;
            }
        });
    });

    return formatSideResult(result);
}

function parseTowerItems(itemMap) {
    const result = { blue: {}, red: {} };

    ['blue', 'red'].forEach(side => {
        Object.entries(TOWER_ATTRIBUTES).forEach(([attrKey, attr]) => {
            const gameIds = getGameIds(attr, side);
            // 防御塔有多个 ID，取第一个匹配到的值
            for (const id of gameIds) {
                const value = itemMap.get(String(id));
                if (value !== undefined) {
                    result[side][attr.label] = attr.options[parseInt(value)] || value;
                    break;
                }
            }
        });
    });

    return formatSideResult(result);
}

function formatSideResult(result) {
    const { blue, red } = result;
    if (Object.keys(blue).length === 0 && Object.keys(red).length === 0) return null;

    const blueStr = formatAttrs(blue);
    const redStr = formatAttrs(red);

    if (blueStr === redStr && blueStr) return `全部阵营: ${blueStr}`;

    const lines = [];
    if (blueStr) lines.push(`蓝方: ${blueStr}`);
    if (redStr) lines.push(`红方: ${redStr}`);
    return lines.join('\n');
}

// ============ 英雄属性解析 ============

function parseHeroItems(itemMap, playerCount) {
    const heroData = {};

    for (let i = 0; i < playerCount * 2; i++) {
        heroData[i] = {};
    }

    ['blue', 'red'].forEach((side, sideIndex) => {
        const offset = sideIndex === 0 ? 0 : playerCount;

        Object.entries(HERO_ATTRIBUTES).forEach(([attrKey, attr]) => {
            for (let pos = 0; pos < playerCount; pos++) {
                const gameIds = getGameIds(attr, side, pos);

                gameIds.forEach(id => {
                    const value = itemMap.get(String(id));
                    if (value !== undefined) {
                        heroData[offset + pos][attr.label] = attr.options[parseInt(value)] || value;
                    }
                });
            }
        });
    });

    return groupHeroBySide(heroData, playerCount);
}

function groupHeroBySide(heroData, playerCount) {
    const getPlayers = (start, count) => {
        const players = [];
        for (let i = start; i < start + count; i++) {
            if (Object.keys(heroData[i]).length > 0) {
                players.push({ pos: i - start + 1, attrs: heroData[i] });
            }
        }
        return players;
    };

    const bluePlayers = getPlayers(0, playerCount);
    const redPlayers = getPlayers(playerCount, playerCount);

    if (bluePlayers.length === 0 && redPlayers.length === 0) return null;

    const allPlayers = [...bluePlayers, ...redPlayers];
    // 全部阵营相同判断
    if (allPlayers.length === playerCount * 2) {
        const firstAttrs = allPlayers[0].attrs;
        if (allPlayers.every(p => deepEqual(p.attrs, firstAttrs))) {
            return `全部阵营: ${formatAttrs(firstAttrs)}`;
        }
    }

    const formatTeam = (players, teamName, totalCount) => {
        if (players.length === 0) return [];
        if (players.length === totalCount) {
            const first = players[0].attrs;
            if (players.every(p => deepEqual(p.attrs, first))) {
                return [`${teamName}全部位置: ${formatAttrs(first)}`];
            }
        }
        return players.map(p => `${teamName}位置 ${p.pos}: ${formatAttrs(p.attrs)}`);
    };

    return [
        ...formatTeam(bluePlayers, '蓝方', playerCount),
        ...formatTeam(redPlayers, '红方', playerCount)
    ].join('\n');
}

// ============ 胜利条件解析 ============

function parseVictoryItems(itemMap) {
    // 反向遍历：当多个配置存在包含关系时，优先匹配更复杂的配置
    // 例如配置10 {19:2,105:1,104:2} 包含配置8 {19:2,105:1}，先检查10可避免误匹配
    const indexes = VICTORY_CONDITIONS.map(c => c.value)
        .filter(idx => idx !== 0)  // 排除索引0，空对象{}会匹配任何情况，需特殊处理
        .sort((a, b) => b - a);    // 降序排列

    for (const index of indexes) {
        const condition = VICTORY_CONDITIONS.find(c => c.value === index);
        if (!condition?.config) continue;

        const match = Object.entries(condition.config).every(
            ([id, value]) => itemMap.get(id) === String(value)
        );

        if (match) return condition.label;
    }

    return VICTORY_CONDITIONS[DEFAULT_VICTORY].label;
}

// ============ 游戏数据转网页配置 ============

export function parseGameDataToConfig(gameData) {
    try {
        if (!gameData) throw new Error('无效的游戏数据');

        if (!gameData.customDefineItems || !gameData.banHerosCamp1 || !gameData.banHerosCamp2) {
            alert("仅开房模式不支持复制配置");
            return null;
        }

        const playerCount = parseInt(gameData.teamerNum) / 2;
        const itemMap = new Map();

        (gameData.customDefineItems || []).forEach(item => {
            const [id, value] = item.split(':');
            itemMap.set(id, value);
        });

        // 解析器映射
        const PARSER_MAP = {
            hero: (itemMap, playerCount) => parseHeroConfigFromItems(itemMap, playerCount),
            minionAndMonster: (itemMap) => parseCategoryConfigFromItems(itemMap, MINION_ATTRIBUTES, MONSTER_ATTRIBUTES),
            towerAndCrystal: (itemMap) => parseCategoryConfigFromItems(itemMap, TOWER_ATTRIBUTES, CRYSTAL_ATTRIBUTES)
        };

        const uiConfig = { victory: parseVictoryConfigFromItems(itemMap) };

        UI_SECTIONS.forEach(section => {
            const { tabKey } = section;
            if (PARSER_MAP[tabKey]) {
                uiConfig[tabKey] = PARSER_MAP[tabKey](itemMap, playerCount);
            } else {
                alert(`没有对应的解析器: ${tabKey}`);
                throw new Error(`没有找到 tabKey 对应的解析器: ${tabKey}`);
            }
        });

        const advancedData = {
            mapID: gameData.mapID,
            heroBans: heroData.parseBanHeroesFromIds(gameData.banHerosCamp1),
            randomGen: {},
            randomShuffle: {}
        };

        const config = buildFullConfig(uiConfig, advancedData, {
            name: `导入配置_${Date.now()}`
        });

        return compressConfig(config);
    } catch (error) {
        console.error('解析游戏数据失败:', error);
        throw error;
    }
}

// ============ 配置解析辅助函数 ============

function parseHeroConfigFromItems(itemMap, playerCount) {
    const playerValues = {
        blue: Array(playerCount).fill(null).map(() => ({})),
        red: Array(playerCount).fill(null).map(() => ({}))
    };

    ['blue', 'red'].forEach(side => {
        const teamData = playerValues[side];

        Object.entries(HERO_ATTRIBUTES).forEach(([attrKey, attr]) => {
            for (let pos = 0; pos < playerCount; pos++) {
                const gameIds = getGameIds(attr, side, pos);

                gameIds.forEach(id => {
                    const value = itemMap.get(String(id));
                    if (value !== undefined) {
                        teamData[pos][attrKey] = value;
                    }
                });
            }
        });
    });

    return detectHeroMode(playerValues, playerCount);
}

function detectHeroMode(playerValues, playerCount) {
    const { blue, red } = playerValues;
    const firstPlayer = blue[0];

    // 检查是否全部相同
    const allSame = [...blue, ...red].every(p => deepEqual(p, firstPlayer));

    if (allSame) {
        return { mode: 'all', data: firstPlayer };
    }

    // 检查蓝红各自内部是否相同
    const blueSame = blue.every(p => deepEqual(p, blue[0]));
    const redSame = red.every(p => deepEqual(p, red[0]));

    if (blueSame && redSame) {
        return {
            mode: 'team',
            data: { blue: blue[0], red: red[0] }
        };
    }

    return {
        mode: 'player',
        data: { blue, red }
    };
}

function parseCategoryConfigFromItems(itemMap, mainAttrs, secondaryAttrs = null) {
    const collectValues = (side, attributes) => {
        const values = {};

        Object.entries(attributes).forEach(([attrKey, attr]) => {
            const gameIds = getGameIds(attr, side);
            const value = itemMap.get(String(gameIds[0]));

            values[attrKey] = value !== undefined
                ? value
                : String(getDefaultValueByKey(attrKey));
        });

        return values;
    };

    const blueValues = collectValues('blue', mainAttrs);
    const redValues = collectValues('red', mainAttrs);

    if (secondaryAttrs) {
        Object.assign(blueValues, collectValues('blue', secondaryAttrs));
        Object.assign(redValues, collectValues('red', secondaryAttrs));
    }

    if (deepEqual(blueValues, redValues)) {
        return { mode: 'all', data: blueValues };
    }

    return { mode: 'team', data: { blue: blueValues, red: redValues } };
}

function parseVictoryConfigFromItems(itemMap) {
    // 反向遍历：当多个配置存在包含关系时，优先匹配更复杂的配置
    const indexes = VICTORY_CONDITIONS.map(c => c.value)
        .filter(idx => idx !== 0)  // 排除索引0，空对象{}会匹配任何情况，需特殊处理
        .sort((a, b) => b - a);    // 降序排列

    for (const index of indexes) {
        const condition = VICTORY_CONDITIONS.find(c => c.value === index);
        if (!condition?.config) continue;

        const match = Object.entries(condition.config).every(
            ([id, value]) => itemMap.get(id) === String(value)
        );

        if (match) return String(index);
    }

    return String(DEFAULT_VICTORY);
}