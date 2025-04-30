package com.cool.modules.user.service.impl;

import cn.hutool.crypto.digest.MD5;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.cool.core.base.BaseServiceImpl;
import com.cool.modules.user.entity.UserInfoEntity;
import com.cool.modules.user.mapper.UserInfoMapper;
import com.cool.modules.user.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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
