package com.cool.modules.resource.entity;

import com.cool.core.base.BaseEntity;
import com.mybatisflex.annotation.Table;
import com.tangzc.mybatisflex.autotable.annotation.ColumnDefine;
import lombok.Getter;
import lombok.Setter;

/**
 * 资源分类
 *
 * @author 实训系统
 */
@Getter
@Setter
@Table(value = "resource_category", comment = "资源分类表")
public class ResourceCategory extends BaseEntity<ResourceCategory> {

    @ColumnDefine(comment = "分类名称", notNull = true)
    private String name;

    @ColumnDefine(comment = "分类描述")
    private String description;

    @ColumnDefine(comment = "分类图标")
    private String icon;

    @ColumnDefine(comment = "排序号")
    private Integer orderNum;

    @ColumnDefine(comment = "父级ID")
    private Long parentId;
} 