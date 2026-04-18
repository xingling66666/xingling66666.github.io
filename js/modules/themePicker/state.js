// modules/themePicker/state.js

/**
 * 主题选择器状态管理
 * 使用单例模式确保状态唯一
 */

const state = {
    // DOM 元素
    container: null,
    presetList: null,
    customColorInput: null,
    imageInput: null,
    dropdown: null,
    outlinedIcon: null,
    filledIcon: null,
    
    // 当前主题色
    currentColor: null
};

// ============ Getters ============

export const getState = () => state;

export const getContainer = () => state.container;
export const getPresetList = () => state.presetList;
export const getCustomColorInput = () => state.customColorInput;
export const getImageInput = () => state.imageInput;
export const getDropdown = () => state.dropdown;

export const getCurrentColor = () => state.currentColor;

// ============ Setters ============

export const setContainer = (container) => { state.container = container; };
export const setPresetList = (list) => { state.presetList = list; };
export const setCustomColorInput = (input) => { state.customColorInput = input; };
export const setImageInput = (input) => { state.imageInput = input; };
export const setDropdown = (dropdown) => { state.dropdown = dropdown; };
export const setOutlinedIcon = (icon) => { state.outlinedIcon = icon; };
export const setFilledIcon = (icon) => { state.filledIcon = icon; };

export const setCurrentColor = (color) => { state.currentColor = color; };

// ============ 状态重置 ============

export const resetState = () => {
    state.container = null;
    state.presetList = null;
    state.customColorInput = null;
    state.imageInput = null;
    state.dropdown = null;
    state.outlinedIcon = null;
    state.filledIcon = null;
    state.currentColor = null;
};