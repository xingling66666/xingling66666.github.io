// ui/components/dialog/index.js - 弹窗工具模块（mdui 封装）

/**
 * 显示提示弹窗 (Alert)
 * @param {Object|string} options - 配置对象或提示文本
 */
export function showAlert(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    mdui.alert({
        headline: options.headline || '提示',
        description: options.description || '',
        confirmText: options.confirmText || '我知道了',
        onConfirm: options.onConfirm || (() => {})
    });
}

/**
 * 显示确认弹窗 (Confirm)
 * @param {Object|string} options - 配置对象或提示文本
 * @returns {Promise<boolean>}
 */
export function showConfirm(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    return new Promise((resolve) => {
        mdui.confirm({
            headline: options.headline || '提示',
            description: options.description || '',
            confirmText: options.confirmText || '确认',
            cancelText: options.cancelText || '取消',
            onConfirm: () => {
                options.onConfirm?.();
                resolve(true);
            },
            onCancel: () => {
                options.onCancel?.();
                resolve(false);
            }
        });
    });
}

/**
 * 显示输入弹窗 (Prompt)
 * @param {Object|string} options - 配置对象或提示文本
 * @returns {Promise<string|null>}
 */
export function showPrompt(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    return new Promise((resolve) => {
        mdui.prompt({
            headline: options.headline || '输入',
            description: options.description || '',
            confirmText: options.confirmText || '确认',
            cancelText: options.cancelText || '取消',
            textFieldOptions: {
                defaultValue: options.defaultValue || '',
                placeholder: options.placeholder || ''
            },
            onConfirm: (value) => {
                options.onConfirm?.(value);
                resolve(value);
            },
            onCancel: () => {
                options.onCancel?.();
                resolve(null);
            }
        });
    });
}

/**
 * 显示自定义弹窗 (Dialog)
 * @param {Object} options - 配置对象
 */
export function showDialog(options) {
    return mdui.dialog({
        headline: options.headline || '',
        description: options.description || '',
        body: options.body || '',
        actions: options.actions || [],
        modal: options.modal !== false,
        closeOnOverlayClick: options.closeOnOverlayClick !== false,
        onOpen: options.onOpen || (() => {}),
        onClose: options.onClose || (() => {})
    });
}

/**
 * 显示轻提示 (Snackbar)
 * @param {string|Object} options - 提示文本或配置对象
 */
export function showSnackbar(options) {
    if (typeof options === 'string') {
        mdui.snackbar({ message: options });
    } else {
        mdui.snackbar({
            message: options.message || '',
            placement: options.placement || 'bottom',
            autoCloseDelay: options.timeout || 3000
        });
    }
}

// 默认导出
export default {
    showAlert,
    showConfirm,
    showPrompt,
    showDialog,
    showSnackbar
};