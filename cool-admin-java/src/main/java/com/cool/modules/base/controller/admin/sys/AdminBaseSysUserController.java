package com.cool.modules.base.controller.admin.sys;

import cn.hutool.core.lang.Dict;
import cn.hutool.json.JSONObject;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import com.cool.core.annotation.CoolRestController;
import com.cool.core.base.BaseController;
import com.cool.core.request.R;
import com.cool.modules.base.entity.sys.BaseSysUserEntity;
import com.cool.modules.base.service.sys.BaseSysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 系统用户
 */
@Tag(name = "系统用户", description = "系统用户")
@CoolRestController(api = { "add", "delete", "update", "page", "info" })
public class AdminBaseSysUserController extends BaseController<BaseSysUserService, BaseSysUserEntity> {

    @Override
    protected void init(HttpServletRequest request, JSONObject requestParams) {
    }

    @Operation(summary = "移动部门")
    @PostMapping("/move")
    public R move(@RequestAttribute JSONObject requestParams) {
        service.move(requestParams.getLong("departmentId"), requestParams.get("userIds", Long[].class));
        return R.ok();
    }
    
    @PostMapping("/importUsers")
    @Operation(summary = "批量导入用户")
    public R importUsers(@RequestParam("file") MultipartFile file, @RequestParam("departmentId") Long departmentId) {
        List<BaseSysUserEntity> result = service.importUsers(file, departmentId);
        return R.ok(result);
    }
    
    @GetMapping("/downloadTemplate")
    @Operation(summary = "下载用户导入模板")
    public void downloadTemplate(HttpServletResponse response, @RequestParam(value = "token", required = false) String token) throws IOException {
        // 如果提供了token，可以在这里处理认证逻辑
        
        // 创建ExcelWriter对象
        ExcelWriter writer = ExcelUtil.getBigWriter();
        
        // 设置表头文字 - 第一行
        writer.writeRow(Arrays.asList(
            "用户名(必填)", "姓名(必填)", "昵称(必填)", "部门名称(自动分配)", "角色(导入后设置)", 
            "状态(0-禁用,1-启用)", "手机号码", "邮箱", "密码(默认123456)", "备注"
        ));
        
        // 写入示例数据 - 第二行
        writer.writeRow(Arrays.asList(
            "test_user", "测试用户", "测试昵称", "导入时由选择的部门决定", "导入后需单独设置", 
            "1", "13800138000", "test@example.com", "123456", "备注信息"
        ));
        
        // 设置列宽
        for (int i = 0; i < 10; i++) {
            writer.setColumnWidth(i, 25);
        }
        
        // 设置响应头
        response.setContentType("application/vnd.ms-excel;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment;filename=user_import_template.xls");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Cache-Control", "no-cache");
        
        // 写入响应流
        writer.flush(response.getOutputStream());
        writer.close();
    }
}