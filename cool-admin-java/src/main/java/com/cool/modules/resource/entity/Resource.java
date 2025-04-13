package com.cool.modules.resource.entity;

import com.cool.core.base.BaseEntity;
import com.mybatisflex.annotation.Table;
import com.tangzc.mybatisflex.autotable.annotation.ColumnDefine;
import lombok.Getter;
import lombok.Setter;

/**
 * 资源信息
 *
 * @author 实训系统
 */
@Getter
@Setter
@Table(value = "resource", comment = "资源信息表")
public class Resource extends BaseEntity<Resource> {

    @ColumnDefine(comment = "资源名称", notNull = true)
    private String name;

    @ColumnDefine(comment = "资源描述")
    private String description;

    @ColumnDefine(comment = "资源类型", notNull = true)
    private String type;

    @ColumnDefine(comment = "资源分类ID", notNull = true)
    private Long categoryId;

    @ColumnDefine(comment = "资源URL", notNull = true)
    private String url;

    @ColumnDefine(comment = "封面URL")
    private String coverUrl;

    @ColumnDefine(comment = "文件大小(KB)")
    private Long fileSize;

    @ColumnDefine(comment = "上传者ID")
    private Long userId;

    @ColumnDefine(comment = "上传者姓名")
    private String userName;

    @ColumnDefine(comment = "查看次数")
    private Integer viewCount;

    @ColumnDefine(comment = "下载次数")
    private Integer downloadCount;

    @ColumnDefine(comment = "审核状态(0:待审核,1:已通过,2:已拒绝)")
    private Integer status;

    @ColumnDefine(comment = "审核备注")
    private String auditRemark;
} 