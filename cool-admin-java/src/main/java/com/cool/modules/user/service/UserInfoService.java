package com.cool.modules.user.service;

import com.cool.core.base.BaseService;
import com.cool.modules.user.entity.UserInfoEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserInfoService extends BaseService<UserInfoEntity> {
    /**
     * 用户个人信息
     * @param userId
     * @return
     */
    UserInfoEntity person(Long userId);

    /**
     * 更新用户密码
     */
    void updatePassword(Long userId, String password, String code);

    /**
     * 注销
     */
    void logoff(Long currentUserId);

    /**
     * 绑定手机号
     */
    void bindPhone(Long currentUserId, String phone, String code);
    
    /**
     * 更新个人信息
     * @param userId 用户ID
     * @param personInfo 个人信息
     */
    void updatePersonInfo(Long userId, UserInfoEntity personInfo);
    
    /**
     * 批量导入用户
     * @param file Excel文件
     * @return 导入结果信息
     */
    List<UserInfoEntity> importUsers(MultipartFile file);
}
