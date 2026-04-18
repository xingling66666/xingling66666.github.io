// modules/themePicker/constants.js

/**
 * 预设颜色配置
 */
export const PRESET_COLORS = [
    { name: 'red', color: '#bb1614', className: 'red' },
    { name: 'purple', color: '#9a25ae', className: 'purple' },
    { name: 'blue', color: '#0061a4', className: 'blue' },
    { name: 'green', color: '#006e1c', className: 'green' },
    { name: 'yellow', color: '#695f00', className: 'yellow' },
    { name: 'grey', color: '#006874', className: 'grey' }
];

/**
 * 文件限制
 */
export const FILE_LIMITS = {
    maxSize: 10 * 1024 * 1024,  // 10MB
    acceptedTypes: ['image/']
};

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
    invalidType: '请选择图片文件',
    fileTooLarge: '图片大小不能超过 10MB',
    loadFailed: '图片加载失败',
    readFailed: '文件读取失败',
    extractFailed: '提取颜色失败',
    notSupported: '当前环境不支持提取颜色'
};

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
    extracting: '正在提取主题色...',
    applied: '主题色已应用',
    randomGenerated: '已随机生成主题配色，不满意可点击右上角调整'
};