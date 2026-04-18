// utils/config/validator.js
import { DEFAULT_VICTORY, isEffectiveValueByKey } from './constants.js';

// ============ 配置检测 ============

/**
 * 检查配置是否有任何自定义内容
 */
export function checkHasCustomConfig(config) {
    if (!config) return false;

    const hasCustom = TAB_KEYS.some(key => checkPanelHasConfig(config[key]));
    const hasVictory = config.victory && String(config.victory) !== String(DEFAULT_VICTORY);
    
    return hasCustom || hasVictory;
}

/**
 * 检查单个面板是否有配置
 */
export function checkPanelHasConfig(panel) {
    if (!panel?.data) return false;

    const { mode, data } = panel;
    const isEffective = (val, key) => isEffectiveValueByKey(key, val);

    if (mode === 'all') {
        return Object.entries(data).some(([key, val]) => isEffective(val, key));
    }
    
    if (mode === 'team') {
        const hasSide = (side) => data[side] && Object.entries(data[side]).some(([key, val]) => isEffective(val, key));
        return hasSide('blue') || hasSide('red');
    }
    
    if (mode === 'player') {
        const hasSide = (side) => data[side] && Object.entries(data[side]).some(([key, arr]) => 
            Array.isArray(arr) && arr.some(val => isEffective(val, key))
        );
        return hasSide('blue') || hasSide('red');
    }

    return false;
}

/**
 * 检查配置是否为空（没有任何自定义内容）
 */
export function isConfigEmpty(config) {
    return !checkHasCustomConfig(config);
}

/** 检查是否是随机禁用配置 */
export const isRandomBanConfig = (value) => {
    return value?.includes("随机") || false;
};

/**
 * 检查当前地图网页是否可开房
 */

export { isWebCreateableMapById } from '../../data/mapData.js';

/**
 * 检查当前地图是否为仅开房模式
 */
export { isRoomOnlyMapById } from '../../data/mapData.js';