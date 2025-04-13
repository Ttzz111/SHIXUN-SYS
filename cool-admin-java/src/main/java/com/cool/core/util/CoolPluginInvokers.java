package com.cool.core.util;

import cn.hutool.json.JSONUtil;
import com.cool.core.exception.CoolPreconditions;
import lombok.extern.slf4j.Slf4j;

/**
 * 插件调用封装(已简化)
 */
@Slf4j
public class CoolPluginInvokers {

    /**
     * 插件默认调用入口
     */
    public static Object invokePlugin(String key, String... params) {
        return invoke(key, "invokePlugin", params);
    }

    /**
     * 反射调用插件
     *
     * @param key        插件key
     * @param methodName 插件方法
     * @param params     参数
     */
    public static Object invoke(String key, String methodName, Object... params) {
        log.info("调用插件类: {}, 方法: {} 参数: {}", key, methodName, params);
        CoolPreconditions.alwaysThrow("插件功能已移除");
        return null;
    }
}
