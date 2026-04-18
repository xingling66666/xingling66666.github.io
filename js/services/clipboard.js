// clipboard.js - 剪贴板服务

/**
 * 复制文本到剪贴板
 */
export async function copyText(text, showTip = true) {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            if (showTip) showSuccessTip();
            return true;
        } catch (err) {
            console.warn('Clipboard API 失败，尝试 fallback:', err);
            // 降级到 execCommand
            return fallbackCopy(text, showTip);
        }
    } else {
        // 不支持 Clipboard API，使用 fallback
        return fallbackCopy(text, showTip);
    }
}

/**
 * 降级复制方法
 */
function fallbackCopy(text, showTip) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
        const success = document.execCommand('copy');
        if (success) {
            if (showTip) showSuccessTip();
            return true;
        } else {
            throw new Error('execCommand 返回 false');
        }
    } catch (err) {
        console.error('复制失败:', err);
        if (showTip) showErrorTip();
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * 显示成功提示
 */
function showSuccessTip() {
    const message = "复制成功";
    if (typeof mdui !== 'undefined') {
        mdui.snackbar({ message });
    } else {
        alert(message);
    }
}

/**
 * 显示失败提示
 */
function showErrorTip() {
    const message = "复制失败";
    if (typeof mdui !== 'undefined') {
        mdui.snackbar({ message });
    } else {
        alert(message);
    }
}