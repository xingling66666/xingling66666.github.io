// modules/mapSelector/index.js

import { createMapSelectorPanel } from './panel.js';
import { resetState } from './state.js';

let panel = null;

/**
 * 初始化地图选择器
 */
export const initMapSelector = () => {
    if (!panel) {
        panel = createMapSelectorPanel();
    }
    return panel.init();
};

/**
 * 刷新地图菜单
 */
export const refreshMapMenu = () => {
    panel?.refresh();
};

/**
 * 获取当前选中的地图
 */
export const getCurrentMap = () => {
    return panel?.getCurrentMap() || '';
};

/**
 * 设置当前地图
 */
export const setCurrentMap = (mapName) => {
    panel?.setCurrentMap(mapName);
};

/**
 * 获取所有可创建的地图名称
 */
export const getMapNames = () => {
    return panel?.getMapNames() || [];
};

/**
 * 检查地图是否存在
 */
export const hasMap = (mapName) => {
    return panel?.hasMap(mapName) || false;
};

/**
 * 销毁地图选择器
 */
export const destroyMapSelector = () => {
    panel = null;
    resetState();
};

// 默认导出
export default {
    initMapSelector,
    refreshMapMenu,
    getCurrentMap,
    setCurrentMap,
    getMapNames,
    hasMap,
    destroyMapSelector
};