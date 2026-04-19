// clipboard.js - 剪贴板服务

/**
 * 复制文本到剪贴板
 */
export async function copyText(text, showTip = true) {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            if (showTip) showMessage('复制成功', 'success');
            return true;
        } catch (err) {
            // 通常清空下的失败原因：页面无焦点元素，且用户未授权读取权限
            // 降级到 execCommand（同样需要焦点，大概率也会失败）
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
            if (showTip) showMessage('复制成功', 'success');
            return true;
        } else {
            throw new Error('execCommand 返回 false');
        }
    } catch (err) {
        console.error('降级复制失败:', err);
        if (showTip) showMessage('复制失败', 'error')
        alert('复制失败，请手动复制以下内容：\n\n' + text);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}
/**
 * 显示提示信息
 */
function showMessage(message, type = 'info') {
    if (typeof mdui?.snackbar === 'function') {
        mdui.snackbar({ message });
    } else {
        console.log(`[${type}]`, message);
    }
}