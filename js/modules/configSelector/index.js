// modules/configSelector/index.js

import { createConfigSelectorPanel } from './panel.js';
import { resetAllState } from './state.js';

let panel = null;

/**
 * 初始化配置选择器
 */
export const initConfigSelector = () => {
    if (!panel) {
        panel = createConfigSelectorPanel();
    }
    return panel.init();
};

/**
 * 打开配置选择器
 */
export const openConfigDialog = () => {
    if (!panel) {
        console.warn('配置选择器未初始化');
        return;
    }
    panel.open();
};

/**
 * 关闭配置选择器
 */
export const closeConfigDialog = () => {
    panel?.close();
};

/**
 * 获取当前配置名
 */
export const getCurrentConfigName = () => {
    return panel?.getCurrentConfigName() || '';
};

/**
 * 获取当前配置
 */
export const getCurrentConfig = () => {
    return panel?.getCurrentConfig() || null;
};

/**
 * 获取当前模式
 */
export const getCurrentMode = () => {
    return panel?.getCurrentMode() || 'randomGen';
};

/**
 * 刷新配置 UI
 */
export const refreshConfigUI = () => {
    panel?.refresh();
    resetAllState();
};

// 默认导出
export default {
    initConfigSelector,
    openConfigDialog,
    closeConfigDialog,
    getCurrentConfigName,
    getCurrentConfig,
    getCurrentMode,
    refreshConfigUI
};