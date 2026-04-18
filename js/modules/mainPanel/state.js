// modules/mainPanel/state.js

/**
 * 主面板状态管理
 */

const state = {
    // 工作状态
    workMessage: null,
    
    // 长按计时器
    longPressTimer: null,
    
    // 初始化状态
    initialized: false,
    
    // 链接动作常量
    LinkAction: {
        LAUNCH: 'launch',
        COPY: 'copy'
    }
};

// ============ Getters ============

export const getState = () => state;

export const getWorkMessage = () => state.workMessage;
export const getLongPressTimer = () => state.longPressTimer;
export const isInitialized = () => state.initialized;
export const getLinkAction = () => state.LinkAction;

// ============ Setters ============

export const setWorkMessage = (msg) => { state.workMessage = msg; };
export const setLongPressTimer = (timer) => { state.longPressTimer = timer; };
export const setInitialized = (value) => { state.initialized = value; };

export const clearLongPressTimer = () => {
    if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
    }
};

// ============ 重置 ============

export const resetState = () => {
    state.workMessage = null;
    state.longPressTimer = null;
    state.initialized = false;
};