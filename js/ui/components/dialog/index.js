// ui/components/dialog/index.js - 弹窗工具模块（mdui 封装）

/**
 * 获取 dialog 的 body 元素
 * @param {HTMLElement} dialog - mdui-dialog 元素
 * @returns {HTMLElement|null}
 */
export function getDialogBody(dialog) {
    if (!dialog || !dialog.shadowRoot) return null;
    return dialog.shadowRoot.querySelector('.body');
}

/**
 * 获取 dialog 的 description 元素
 * @param {HTMLElement} dialog - mdui-dialog 元素
 * @returns {HTMLElement|null}
 */
export function getDialogDescription(dialog) {
    if (!dialog || !dialog.shadowRoot) return null;
    return dialog.shadowRoot.querySelector('.description');
}

/**
 * 设置弹窗内容换行（如果包含换行符）
 * @param {HTMLElement} dialog - mdui-dialog 元素
 */
function enableLineBreakIfNeeded(dialog) {
    const desc = getDialogDescription(dialog);
    if (desc && desc.textContent && desc.textContent.includes('\n')) {
        desc.style.whiteSpace = 'pre-wrap';
    }

    const body = getDialogBody(dialog);
    if (body && body.textContent && body.textContent.includes('\n')) {
        body.style.whiteSpace = 'pre-wrap';
    }
}

/**
 * 显示提示弹窗 (Alert)
 * @param {Object|string} options - 配置对象或提示文本
 * @returns {Promise<void>} 点击确定按钮时 resolve，其他方式关闭时 reject
 */
export function showAlert(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    const alertPromise = mdui.alert({
        headline: options.headline || '提示',
        description: options.description || '',
        confirmText: options.confirmText || '我知道了',
        onConfirm: options.onConfirm || (() => {}),
        onOpen: (dialog) => {
            enableLineBreakIfNeeded(dialog);
            options.onOpen?.call(dialog, dialog);
        }
    });
    
    return alertPromise;
}

/**
 * 显示确认弹窗 (Confirm)
 * @param {Object|string} options - 配置对象或提示文本
 * @returns {Promise<boolean>} 点击确定按钮时 resolve(true)，点击取消或其他方式关闭时 resolve(false)
 */
export function showConfirm(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    const confirmPromise = mdui.confirm({
        headline: options.headline || '提示',
        description: options.description || '',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        onConfirm: options.onConfirm || (() => {}),
        onCancel: options.onCancel || (() => {}),
        onOpen: (dialog) => {
            enableLineBreakIfNeeded(dialog);
            options.onOpen?.call(dialog, dialog);
        }
    });
    
    return confirmPromise.then(() => true).catch(() => false);
}

/**
 * 显示输入弹窗 (Prompt)
 * @param {Object|string} options - 配置对象或提示文本
 * @returns {Promise<string|null>} 点击确定按钮时返回输入值，点击取消或其他方式关闭时返回 null
 */
export function showPrompt(options) {
    if (typeof options === 'string') {
        options = { description: options };
    }

    const promptPromise = mdui.prompt({
        headline: options.headline || '输入',
        description: options.description || '',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        textFieldOptions: {
            defaultValue: options.defaultValue || '',
            placeholder: options.placeholder || ''
        },
        onConfirm: options.onConfirm || (() => {}),
        onCancel: options.onCancel || (() => {}),
        onOpen: (dialog) => {
            enableLineBreakIfNeeded(dialog);
            options.onOpen?.call(dialog, dialog);
        }
    });
    
    return promptPromise.then((value) => value ?? null).catch(() => null);
}

/**
 * 显示自定义弹窗 (Dialog)
 * @param {Object} options - 配置对象
 * @returns {Object} dialog 实例
 */
export function showDialog(options) {
    const dialog = mdui.dialog({
        headline: options.headline || '',
        description: options.description || '',
        body: options.body || '',
        actions: options.actions || [],
        modal: options.modal !== false,
        closeOnOverlayClick: options.closeOnOverlayClick !== false,
        onOpen: (dialogInstance) => {
            enableLineBreakIfNeeded(dialogInstance);
            options.onOpen?.call(dialogInstance, dialogInstance);
        },
        onClose: options.onClose || (() => {})
    });
    
    return dialog;
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

export default {
    showAlert,
    showConfirm,
    showPrompt,
    showDialog,
    showSnackbar,
    getDialogBody,
    getDialogDescription
};