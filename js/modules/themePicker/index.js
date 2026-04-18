// modules/themePicker/index.js

import { createThemePickerPanel } from './panel.js';
import { resetState } from './state.js';
import { PRESET_COLORS } from './constants.js';
import { generateRandomColor } from './core.js';

let panel = null;

/**
 * 初始化主题选择器
 */
export const initThemePicker = () => {
    if (!panel) {
        panel = createThemePickerPanel();
    }
    return panel.init();
};

/**
 * 获取当前主题色
 */
export const getCurrentTheme = () => {
    return panel?.getCurrentTheme() || '';
};

/**
 * 设置主题色
 */
export const setTheme = (color) => {
    return panel?.setTheme(color);
};

/**
 * 重置主题（随机生成）
 */
export const resetTheme = () => {
    return panel?.resetTheme() || generateRandomColor();
};

/**
 * 获取预设颜色列表
 */
export const getPresetColors = () => {
    return [...PRESET_COLORS];
};

/**
 * 刷新主题选择器
 */
export const refreshThemePicker = () => {
    panel?.refresh();
};

/**
 * 销毁主题选择器
 */
export const destroyThemePicker = () => {
    panel = null;
    resetState();
};

// 默认导出
export default {
    initThemePicker,
    getCurrentTheme,
    setTheme,
    resetTheme,
    getPresetColors,
    refreshThemePicker,
    destroyThemePicker
};