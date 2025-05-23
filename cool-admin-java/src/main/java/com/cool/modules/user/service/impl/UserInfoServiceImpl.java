package com.cool.modules.user.service.impl;

import cn.hutool.crypto.digest.MD5;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.cool.core.base.BaseServiceImpl;
import com.cool.modules.user.entity.UserInfoEntity;
import com.cool.modules.user.mapper.UserInfoMapper;
import com.cool.modules.user.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserInfoServiceImpl extends BaseServiceImpl<UserInfoMapper, UserInfoEntity> implements
    UserInfoService {

    @Override
    public UserInfoEntity person(Long userId) {
        UserInfoEntity info = getById(userId);
        info.setPassword(null);
        return info;
    }

    @Override
    public void updatePassword(Long userId, String password, String code) {
        UserInfoEntity info = getById(userId);
        info.setPassword(MD5.create().digestHex(password));
        info.updateById();
    }

    @Override
    public void logoff(Long userId) {
        UserInfoEntity info = new UserInfoEntity();
        info.setId(userId);
        info.setStatus(2);
        info.setNickName("已注销-00" + userId);
        info.updateById();
    }

    @Override
    public void bindPhone(Long userId, String phone, String code) {
        UserInfoEntity info = new UserInfoEntity();
        info.setId(userId);
        info.setPhone(phone);
        info.updateById();
    }

    @Override
    public void updatePersonInfo(Long userId, UserInfoEntity personInfo) {
        UserInfoEntity info = getById(userId);
        if (info == null) {
            throw new RuntimeException("用户不存在");
        }
        
        log.info("更新用户信息 - 用户ID: {}, 更新数据: {}", userId, personInfo);
        
        // 更新基本信息
        if (personInfo.getRealName() != null) {
            info.setRealName(personInfo.getRealName());
        }
        if (personInfo.getStudentId() != null) {
            info.setStudentId(personInfo.getStudentId());
        }
        if (personInfo.getGender() != null) {
            info.setGender(personInfo.getGender());
        }
        if (personInfo.getCollege() != null) {
            info.setCollege(personInfo.getCollege());
        }
        if (personInfo.getMajor() != null) {
            info.setMajor(personInfo.getMajor());
        }
        if (personInfo.getNickName() != null) {
            info.setNickName(personInfo.getNickName());
        }
        if (personInfo.getPhone() != null) {
            info.setPhone(personInfo.getPhone());
        }
        if (personInfo.getAvatarUrl() != null) {
            info.setAvatarUrl(personInfo.getAvatarUrl());
        }
        
        // 如果提供了新密码，则更新密码
        if (personInfo.getPassword() != null && !personInfo.getPassword().isEmpty()) {
            info.setPassword(MD5.create().digestHex(personInfo.getPassword()));
        }
        
        boolean success = info.updateById();
        log.info("更新用户信息结果: {}", success);
        
        if (!success) {
            throw new RuntimeException("更新用户信息失败");
        }
    }
    
    @Override
    public List<UserInfoEntity> importUsers(MultipartFile file) {
        List<UserInfoEntity> importedUsers = new ArrayList<>();
        
        try {
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            // 将Excel中的数据转为UserInfoEntity对象列表
            List<UserInfoEntity> userList = reader.readAll(UserInfoEntity.class);
            
            for (UserInfoEntity user : userList) {
                // 设置默认状态为正常
                if (user.getStatus() == null) {
                    user.setStatus(1);
                }
                
                // 设置默认性别为未知
                if (user.getGender() == null) {
                    user.setGender(0);
                }
                
                // 如果有密码则进行MD5加密
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                    user.setPassword(MD5.create().digestHex(user.getPassword()));
                }
                
                // 保存用户
                save(user);
                importedUsers.add(user);
            }
        } catch (IOException e) {
            throw new RuntimeException("导入用户失败: " + e.getMessage());
        }
        
        return importedUsers;
    }
}
