// storage.js - 本地存储服务

import { STORAGE_KEYS } from '../config/constants.js';

/**
 * 判断字符串是否为 JSON
 */
function isJSON(str) {
    if (typeof str !== 'string') return false;
    
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
        return false;
    }
}

/**
 * 获取存储值
 */
export function get(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    
    if (value === null) return defaultValue;
    
    if (isJSON(value)) {
        return JSON.parse(value);
    }
    
    return value;
}

/**
 * 设置存储值
 */
export function set(key, value) {
    if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return;
    }
    
    if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, String(value));
    }
}

/**
 * 删除存储值
 */
export function remove(key) {
    localStorage.removeItem(key);
}

/**
 * 清空所有存储
 */
export function clear() {
    localStorage.clear();
}

/**
 * 检查是否存在
 */
export function has(key) {
    return localStorage.getItem(key) !== null;
}

// ============ 游戏基础设置 ============

export function getCurrentGameServer() {
    return get(STORAGE_KEYS.GAME_SERVER, 'zsf');
}

export function setCurrentGameServer(mode) {
    set(STORAGE_KEYS.GAME_SERVER, mode);
}

export function getCurrentMapMode() {
    return get(STORAGE_KEYS.MAP_MODE, '');
}

export function setCurrentMapMode(mode) {
    set(STORAGE_KEYS.MAP_MODE, mode);
}

// ============ 当前选中的配置名称 ============

export function getCurrentBanConfigName() {
    return get(STORAGE_KEYS.CURRENT_BAN_CONFIG_NAME, '');
}

export function setCurrentBanConfigName(name) {
    set(STORAGE_KEYS.CURRENT_BAN_CONFIG_NAME, name);
}

export function getCurrentCustomConfigName() {
    return get(STORAGE_KEYS.CURRENT_CUSTOM_CONFIG_NAME, '');
}

export function setCurrentCustomConfigName(name) {
    set(STORAGE_KEYS.CURRENT_CUSTOM_CONFIG_NAME, name);
}

// ============ 配置集合 ============

export function getBanConfigs() {
    return get(STORAGE_KEYS.BAN_CONFIGS, {});
}

export function setBanConfigs(configs) {
    set(STORAGE_KEYS.BAN_CONFIGS, configs);
}

export function getCustomConfigs() {
    return get(STORAGE_KEYS.CUSTOM_CONFIGS, {});
}

export function setCustomConfigs(configs) {
    set(STORAGE_KEYS.CUSTOM_CONFIGS, configs);
}

// ============ UI/用户偏好 ============

export function getThemeColor() {
    return get(STORAGE_KEYS.THEME_COLOR, null);
}

export function setThemeColor(color) {
    set(STORAGE_KEYS.THEME_COLOR, color);
}

export function getCopyRule() {
    return get(STORAGE_KEYS.COPY_RULE, '{url}');
}

export function setCopyRule(rule) {
    set(STORAGE_KEYS.COPY_RULE, rule);
}

export function getFreeTip() {
    return get(STORAGE_KEYS.FREE_TIP, null);
}

export function setFreeTip(tip) {
    set(STORAGE_KEYS.FREE_TIP, tip);
}

export function getCreateTip() {
    return get(STORAGE_KEYS.CREATE_TIP, null);
}

export function setCreateTip(tip) {
    set(STORAGE_KEYS.CREATE_TIP, tip);
}

export function getCustomSetTip() {
    return get(STORAGE_KEYS.CUSTOM_SET_TIP, null);
}

export function setCustomSetTip(tip) {
    set(STORAGE_KEYS.CUSTOM_SET_TIP, tip);
}

// ============ 数据缓存 ============

export function getAllHeros() {
    return get(STORAGE_KEYS.ALL_HEROS, null);
}

export function setAllHeros(heros) {
    set(STORAGE_KEYS.ALL_HEROS, heros);
}