// modules/themePicker/panel.js

import { $ } from '../../utils/dom.js';
import * as storage from '../../services/storage.js';
import { showSnackbar } from '../../ui/components/dialog/index.js';
import {
    getState,
    setContainer,
    setPresetList,
    setCustomColorInput,
    setImageInput,
    setDropdown,
    setOutlinedIcon,
    setFilledIcon,
    setCurrentColor,
    getCurrentColor
} from './state.js';
import {
    FILE_LIMITS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
} from './constants.js';
import {
    generateRandomColor,
    applyThemeColor,
    validateImageFile,
    extractColorFromImage,
    getInitialThemeColor
} from './core.js';
import {
    renderPresetColors,
    updateCustomColorInput,
    toggleIcons
} from './renderer.js';

/**
 * 创建主题选择器面板
 */
export const createThemePickerPanel = () => {
    const state = getState();
    
    // ============ 初始化 ============
    
    const init = () => {
        // 获取 DOM 元素
        setContainer($('.theme-picker-container'));
        setPresetList($('.theme-preset-list'));
        setCustomColorInput($('#themeCustomColor'));
        setImageInput($('#themeImageInput'));
        setDropdown($('.theme-dropdown'));
        setOutlinedIcon($('.theme-icon-outlined'));
        setFilledIcon($('.theme-icon-filled'));
        
        if (!state.container) {
            console.warn('主题选择器容器未找到');
            return false;
        }
        
        // 渲染预设颜色
        renderPresetColors(state.presetList, handlePresetClick);
        
        // 绑定事件
        bindEvents();
        
        // 恢复主题
        restoreTheme();
        
        console.log('主题选择器初始化完成');
        return true;
    };
    
    // ============ 事件绑定 ============
    
    const bindEvents = () => {
        // 预设颜色点击（已在渲染时绑定）
        
        // 自定义颜色选择器
        if (state.customColorInput) {
            state.customColorInput.addEventListener('input', (e) => {
                const color = e.target.value;
                applyTheme(color);
                storage.setThemeColor(color);
            });
        }
        
        // 壁纸上传
        if (state.imageInput) {
            state.imageInput.addEventListener('change', handleImageUpload);
        }
        
        // 下拉菜单状态
        if (state.dropdown) {
            state.dropdown.addEventListener('open', onDropdownOpen);
            state.dropdown.addEventListener('close', onDropdownClose);
        }
    };
    
    // ============ 事件处理 ============
    
    const handlePresetClick = (color) => {
        applyTheme(color);
    };
    
    const onDropdownOpen = () => {
        toggleIcons({
            outlined: state.outlinedIcon,
            filled: state.filledIcon
        }, true);
    };
    
    const onDropdownClose = () => {
        toggleIcons({
            outlined: state.outlinedIcon,
            filled: state.filledIcon
        }, false);
    };
    
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        
        // 验证文件
        const validation = validateImageFile(file, FILE_LIMITS);
        if (!validation.valid) {
            const message = ERROR_MESSAGES[validation.error] || '文件无效';
            showSnackbar(message);
            e.target.value = '';
            return;
        }
        
        showSnackbar(SUCCESS_MESSAGES.extracting);
        
        try {
            const color = await extractColorFromImage(file);
            applyTheme(color);
            showSnackbar(SUCCESS_MESSAGES.applied);
        } catch (error) {
            const message = ERROR_MESSAGES[error.message] || '提取颜色失败';
            showSnackbar(message);
        } finally {
            e.target.value = '';
        }
    };
    
    // ============ 主题操作 ============
    
    const applyTheme = (color) => {
        const normalizedColor = applyThemeColor(color, {
            updateInput: (c) => updateCustomColorInput(state.customColorInput, c),
            saveToStorage: (c) => {
                storage.setThemeColor(c);
                setCurrentColor(c);
            },
            applyScheme: (c) => {
                if (typeof mdui !== 'undefined') {
                    mdui.setColorScheme(c);
                }
            }
        });
        
        return normalizedColor;
    };
    
    const restoreTheme = () => {
        const initialColor = getInitialThemeColor(() => storage.getThemeColor());
        const storedColor = storage.getThemeColor();
        
        if (!storedColor) {
            // 首次使用，生成随机颜色
            storage.setThemeColor(initialColor);
            applyTheme(initialColor);
            showSnackbar(SUCCESS_MESSAGES.randomGenerated);
        } else {
            applyTheme(storedColor);
        }
    };
    
    // ============ 公共方法 ============
    
    const getCurrentTheme = () => {
        return getCurrentColor() || storage.getThemeColor();
    };
    
    const setTheme = (color) => {
        return applyTheme(color);
    };
    
    const resetTheme = () => {
        const newColor = generateRandomColor();
        applyTheme(newColor);
        return newColor;
    };
    
    const refresh = () => {
        if (state.presetList) {
            renderPresetColors(state.presetList, handlePresetClick);
        }
        restoreTheme();
    };
    
    // ============ 返回 API ============
    
    return {
        init,
        getCurrentTheme,
        setTheme,
        resetTheme,
        refresh
    };
};