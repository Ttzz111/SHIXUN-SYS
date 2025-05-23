package com.cool.modules.user.entity;

import com.cool.core.base.BaseEntity;
import com.mybatisflex.annotation.Table;
import com.tangzc.mybatisflex.autotable.annotation.ColumnDefine;
import com.tangzc.mybatisflex.autotable.annotation.UniIndex;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(value = "user_info", comment = "用户信息")
public class UserInfoEntity extends BaseEntity<UserInfoEntity> {

    @UniIndex
    @ColumnDefine(comment = "登录唯一ID")
    private String unionid;

    @ColumnDefine(comment = "头像")
    private String avatarUrl;

    @ColumnDefine(comment = "昵称")
    private String nickName;

    @UniIndex
    @ColumnDefine(comment = "手机号")
    private String phone;

    @ColumnDefine(comment = "性别 0-未知 1-男 2-女", defaultValue = "0")
    private Integer gender;

    @ColumnDefine(comment = "状态 0-禁用 1-正常 2-已注销", defaultValue = "1")
    private Integer status;

    @ColumnDefine(comment = "密码")
    private String password;

    @ColumnDefine(comment = "真实姓名")
    private String realName;

    @ColumnDefine(comment = "学号/工号")
    private String studentId;

    @ColumnDefine(comment = "学院")
    private String college;

    @ColumnDefine(comment = "专业")
    private String major;
}
