package com.cool.modules.user.controller.admin;

import static com.cool.modules.user.entity.table.UserInfoEntityTableDef.USER_INFO_ENTITY;

import cn.hutool.json.JSONObject;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import com.cool.core.annotation.CoolRestController;
import com.cool.core.base.BaseController;
import com.cool.core.request.R;
import com.cool.modules.user.entity.UserInfoEntity;
import com.cool.modules.user.service.UserInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "用户信息", description = "用户信息")
@CoolRestController(api = {"add", "delete", "update", "page", "list", "info"})
public class AdminUserInfoController extends BaseController<UserInfoService, UserInfoEntity> {

    @Override
    protected void init(HttpServletRequest request, JSONObject requestParams) {

        setPageOption(createOp().fieldEq(USER_INFO_ENTITY.STATUS, USER_INFO_ENTITY.GENDER)
            .keyWordLikeFields(USER_INFO_ENTITY.NICK_NAME, USER_INFO_ENTITY.PHONE));
    }
    
    @PostMapping("/importUsers")
    @Operation(summary = "批量导入用户")
    public R importUsers(@RequestParam("file") MultipartFile file) {
        List<UserInfoEntity> result = service.importUsers(file);
        return R.ok(result);
    }
    
    @GetMapping("/downloadTemplate")
    @Operation(summary = "下载用户导入模板")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        // 创建ExcelWriter对象
        ExcelWriter writer = ExcelUtil.getWriter();
        
        // 设置表头
        writer.addHeaderAlias("nickName", "昵称");
        writer.addHeaderAlias("phone", "手机号");
        writer.addHeaderAlias("password", "密码");
        writer.addHeaderAlias("gender", "性别(0-未知,1-男,2-女)");
        writer.addHeaderAlias("status", "状态(0-禁用,1-正常)");
        
        // 创建示例数据
        List<UserInfoEntity> demoData = new ArrayList<>();
        UserInfoEntity demo = new UserInfoEntity();
        demo.setNickName("示例用户");
        demo.setPhone("13800138000");
        demo.setPassword("123456");
        demo.setGender(1);
        demo.setStatus(1);
        demoData.add(demo);
        
        // 写入数据
        writer.write(demoData, true);
        
        // 设置响应头
        response.setContentType("application/vnd.ms-excel;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment;filename=user_import_template.xls");
        
        // 写入响应流
        writer.flush(response.getOutputStream(), true);
        writer.close();
    }
}
