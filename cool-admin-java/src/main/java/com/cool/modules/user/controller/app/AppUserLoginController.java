package com.cool.modules.user.controller.app;

import com.cool.core.annotation.CoolRestController;
import com.cool.core.annotation.TokenIgnore;
import com.cool.core.enums.UserTypeEnum;
import com.cool.core.exception.CoolPreconditions;
import com.cool.core.request.R;
import com.cool.modules.base.service.sys.BaseSysLoginService;
import com.cool.modules.user.controller.app.params.CaptchaParam;
import com.cool.modules.user.controller.app.params.LoginParam;
import com.cool.modules.user.controller.app.params.RefreshTokenParam;
import com.cool.modules.user.controller.app.params.SmsCodeParam;
import com.cool.modules.user.service.UserLoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor
@Tag(name = "用户登录", description = "用户登录")
@CoolRestController
public class AppUserLoginController {

    private final UserLoginService userLoginService;

    private final BaseSysLoginService baseSysLoginService;

    /**
     * 手机号登录
     */
    @TokenIgnore
    @Operation(summary = "手机号登录")
    @PostMapping("/phone")
    public R phone(
        @RequestBody LoginParam param) {
        String phone = param.getPhone();
        String smsCode = param.getSmsCode();
        CoolPreconditions.checkEmpty(phone);
        CoolPreconditions.checkEmpty(smsCode);
        return R.ok(userLoginService.phoneVerifyCode(phone, smsCode));
    }

    /**
     * 图片验证码
     */
    @TokenIgnore
    @Operation(summary = "图片验证码")
    @GetMapping("/captcha")
    public R captcha(
        @ModelAttribute CaptchaParam param) {
        String type = param.getType();
        Integer width = param.getWidth();
        Integer height = param.getHeight();

        CoolPreconditions.checkEmpty(type);
        CoolPreconditions.checkEmpty(width);
        CoolPreconditions.checkEmpty(height);

        return R.ok(baseSysLoginService.captcha(UserTypeEnum.APP, type, width, height));
    }

    /**
     * 验证码
     */
    @TokenIgnore
    @Operation(summary = "验证码")
    @PostMapping("/smsCode")
    public R smsCode(
        @RequestBody SmsCodeParam param) {
        String phone = param.getPhone();
        String captchaId = param.getCaptchaId();
        String code = param.getCode();

        CoolPreconditions.checkEmpty(phone);
        CoolPreconditions.checkEmpty(captchaId);
        CoolPreconditions.checkEmpty(code);
        userLoginService.smsCode(phone, captchaId, code);
        return R.ok();
    }

    /**
     * 刷新token
     */
    @TokenIgnore
    @Operation(summary = "刷新token")
    @PostMapping("/refreshToken")
    public R refreshToken(@RequestBody RefreshTokenParam param) {
        return R.ok(userLoginService.refreshToken(param.getRefreshToken()));
    }

    /**
     * 密码登录
     */
    @TokenIgnore
    @Operation(summary = "密码登录")
    @PostMapping("/password")
    public R password(
        @RequestBody LoginParam param) {
        String phone = param.getPhone();
        String password = param.getPassword();

        CoolPreconditions.checkEmpty(phone);
        CoolPreconditions.checkEmpty(password);
        return R.ok(userLoginService.password(phone, password));
    }
}
