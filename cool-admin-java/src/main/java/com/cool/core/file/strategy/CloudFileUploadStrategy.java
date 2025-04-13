package com.cool.core.file.strategy;

import com.cool.core.config.FileModeEnum;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component("cloudFileUploadStrategy")
public class CloudFileUploadStrategy implements FileUploadStrategy {

    @Override
    public Object upload(MultipartFile[] files, HttpServletRequest request, Object uploadConfig)
            throws IOException {
        // 云端上传功能已移除
        throw new UnsupportedOperationException("云端上传功能已移除");
    }

    @Override
    public Map<String, String> getMode(String key) {
        return Map.of("mode", FileModeEnum.CLOUD.value(),
            "type", FileModeEnum.CLOUD.type());
    }
}
