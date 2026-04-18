// modules/heroSelector/index.js

import { createHeroSelectorPanel } from './panel.js';
import { resetState, isLoaded } from './state.js';

let panel = null;

/**
 * 初始化英雄选择器
 */
export const initHeroSelector = () => {
    if (!panel) {
        panel = createHeroSelectorPanel();
    }
    return panel.init();
};

/**
 * 打开英雄选择器
 */
export const openHeroSelector = () => {
    panel?.open();
};

/**
 * 关闭英雄选择器
 */
export const closeHeroSelector = () => {
    panel?.close();
};

/**
 * 获取选中的英雄
 */
export const getSelectedHeroes = () => {
    return panel?.getSelectedHeroes() || '';
};

/**
 * 获取当前配置名
 */
export const getCurrentConfigName = () => {
    return panel?.getCurrentConfigName() || '';
};

/**
 * 刷新英雄列表
 */
export const refreshHeroList = () => {
    panel?.refresh();
    resetState();
};

/**
 * 检查是否已加载
 */
export const isHeroListLoaded = () => {
    return isLoaded();
};

/**
 * 调整布局
 */
export const adjustHeroLayout = () => {
    panel?.adjustLayout();
};

// 默认导出
export default {
    initHeroSelector,
    openHeroSelector,
    closeHeroSelector,
    getSelectedHeroes,
    getCurrentConfigName,
    refreshHeroList,
    isHeroListLoaded,
    adjustHeroLayout
};