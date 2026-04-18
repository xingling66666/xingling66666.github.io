// modules/mainPanel/panel.js

import { initHeroData } from '../../data/heroData.js';
import * as storage from '../../services/storage.js';
import { setInitialized, isInitialized } from './state.js';
import { bindButtonEvents, bindInputEvents, bindLongPressEvents, bindGameServerEvents, loadDataFromStorage } from './events.js';
import { getMapNameById } from '../../data/mapData.js';

// ============ 配置获取 ============

export function getGameServer() {
    const group = document.querySelector('.game-server-group');
    return group?.value;
}

export function getCurrentConfig() {
    const configName = document.querySelector('.custom-input')?.value;
    if (!configName) return null;

    const configs = storage.getCustomConfigs() || {};
    return configs[configName] || null;
}

export function getMapName() {
    const config = getCurrentConfig();

    if (config?.advanced?.mapID) {
        const mapId = config.advanced.mapID;
        const mapName = getMapNameById(mapId);
        if (!mapName) {
            alert(`地图ID "${mapId}" 不存在`);
            throw new Error(`地图ID "${mapId}" 不存在`);
        }
        return mapName;
    }

    const mapName = document.querySelector('.map-input')?.value;
    if (!mapName) {
        alert('请先选择或输入地图');
        throw new Error('地图输入为空');
    }

    return mapName;
}

export function getCurrentBanData() {
    const configName = document.querySelector('.hero-ban-input')?.value;
    if (!configName) return null;

    const configs = storage.getBanConfigs() || {};
    const banHeroNames = configs[configName] || null;

    return banHeroNames ? { banConfigName: configName, banHeroNames } : null;
}

export function getBanData() {
    const config = getCurrentConfig();

    if (config?.advanced?.heroBans) {
        return {
            banConfigName: '高级配置',
            banHeroNames: config.advanced.heroBans
        };
    }

    return getCurrentBanData();
}

// ============ 初始化 ============

/**
 * 初始化主面板
 */
export function initMainPanel() {
    if (isInitialized()) {
        console.warn('主面板已初始化');
        return;
    }

    initHeroData();
    bindButtonEvents();
    bindInputEvents();
    bindLongPressEvents();
    bindGameServerEvents();
    loadDataFromStorage();

    setInitialized(true);
    console.log('主面板初始化完成');
}

export default { initMainPanel };