package com.cool.core.file;

import cn.hutool.core.util.ObjUtil;
import com.cool.core.exception.CoolPreconditions;
import com.cool.core.file.strategy.FileUploadStrategy;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileUploadStrategyFactory {

	final private ApplicationContext applicationContext;

	private FileUploadStrategy getStrategy() {
		return applicationContext.getBean("localFileUploadStrategy", FileUploadStrategy.class);
	}

	public Object upload(MultipartFile[] files, HttpServletRequest request) {
		try {
			return getStrategy().upload(files, request, null);
		} catch (IOException e) {
			log.error("上传文件失败", e);
			CoolPreconditions.alwaysThrow("上传文件失败 {}", e.getMessage());
		}
		return null;
	}

	public Object getMode() {
		return getStrategy().getMode(null);
	}
}