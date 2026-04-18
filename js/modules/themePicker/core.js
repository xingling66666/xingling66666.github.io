// modules/themePicker/core.js

/**
 * 生成随机颜色
 * @returns {string} 十六进制颜色值
 */
export const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * 验证颜色格式
 * @param {string} color - 颜色值
 * @returns {boolean} 是否为有效的十六进制颜色
 */
export const isValidHexColor = (color) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

/**
 * 规范化颜色值
 * @param {string} color - 颜色值
 * @returns {string} 规范化的颜色值
 */
export const normalizeColor = (color) => {
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    
    // 简写格式转完整格式 (#RGB -> #RRGGBB)
    if (color.length === 4) {
        const r = color[1];
        const g = color[2];
        const b = color[3];
        color = `#${r}${r}${g}${g}${b}${b}`;
    }
    
    return color.toUpperCase();
};

/**
 * 应用主题色
 * @param {string} color - 颜色值
 * @param {Function} updateInput - 更新输入框的回调
 * @param {Function} saveToStorage - 保存到存储的回调
 * @param {Function} applyScheme - 应用配色方案的回调
 */
export const applyThemeColor = (color, { updateInput, saveToStorage, applyScheme }) => {
    const normalizedColor = normalizeColor(color);
    
    updateInput?.(normalizedColor);
    saveToStorage?.(normalizedColor);
    applyScheme?.(normalizedColor);
    
    return normalizedColor;
};

/**
 * 验证上传的图片文件
 * @param {File} file - 文件对象
 * @param {Object} limits - 限制条件
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file, limits) => {
    if (!file) {
        return { valid: false, error: '没有选择文件' };
    }
    
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'invalidType' };
    }
    
    if (limits?.maxSize && file.size > limits.maxSize) {
        return { valid: false, error: 'fileTooLarge' };
    }
    
    return { valid: true };
};

/**
 * 从图片提取颜色
 * @param {File} file - 图片文件
 * @returns {Promise<string>} 提取的颜色值
 */
export const extractColorFromImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                if (typeof mdui !== 'undefined' && mdui.getColorFromImage) {
                    mdui.getColorFromImage(img)
                        .then(resolve)
                        .catch(() => reject(new Error('extractFailed')));
                } else {
                    reject(new Error('notSupported'));
                }
            };
            
            img.onerror = () => reject(new Error('loadFailed'));
        };
        
        reader.onerror = () => reject(new Error('readFailed'));
        reader.readAsDataURL(file);
    });
};

/**
 * 获取初始主题色
 * @param {Function} getStoredColor - 获取存储颜色的回调
 * @returns {string} 主题色
 */
export const getInitialThemeColor = (getStoredColor) => {
    const storedColor = getStoredColor?.();
    
    if (storedColor && isValidHexColor(storedColor)) {
        return storedColor;
    }
    
    return generateRandomColor();
};