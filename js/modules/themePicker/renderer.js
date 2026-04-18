// modules/themePicker/renderer.js

import { createElement, clearContainer } from '../../utils/dom.js';
import { PRESET_COLORS } from './constants.js';

/**
 * 渲染预设颜色列表
 * @param {HTMLElement} container - 容器元素
 * @param {Function} onSelectColor - 选择颜色的回调
 */
export const renderPresetColors = (container, onSelectColor) => {
    if (!container) return;
    
    clearContainer(container);
    
    PRESET_COLORS.forEach(preset => {
        const presetDiv = createElement('div', {
            className: `theme-preset ${preset.className}`,
            dataset: { color: preset.color },
            style: {
                backgroundColor: preset.color
            }
        });
        
        if (onSelectColor) {
            presetDiv.addEventListener('click', () => onSelectColor(preset.color));
        }
        
        container.appendChild(presetDiv);
    });
};

/**
 * 更新自定义颜色输入框的值
 * @param {HTMLInputElement} input - 输入框元素
 * @param {string} color - 颜色值
 */
export const updateCustomColorInput = (input, color) => {
    if (input) {
        input.value = color;
    }
};

/**
 * 切换图标显示状态
 * @param {Object} icons - 图标元素对象
 * @param {boolean} isOpen - 是否打开状态
 */
export const toggleIcons = (icons, isOpen) => {
    const { outlined, filled } = icons;
    
    if (outlined) {
        outlined.style.display = isOpen ? 'none' : 'inline-block';
    }
    if (filled) {
        filled.style.display = isOpen ? 'inline-block' : 'none';
    }
};

/**
 * 获取预设颜色列表
 */
export const getPresetColors = () => {
    return [...PRESET_COLORS];
};

/**
 * 查找预设颜色配置
 * @param {string} color - 颜色值
 * @returns {Object|undefined} 预设配置
 */
export const findPresetByColor = (color) => {
    return PRESET_COLORS.find(preset => 
        preset.color.toLowerCase() === color.toLowerCase()
    );
};