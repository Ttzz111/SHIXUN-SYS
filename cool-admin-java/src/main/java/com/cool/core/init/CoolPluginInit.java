package com.cool.core.init;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 移除插件初始化功能
 **/
@Slf4j
@Component
public class CoolPluginInit {

    @EventListener(ApplicationReadyEvent.class)
    public void run() {
        log.info("插件初始化功能已移除");
    }
}
