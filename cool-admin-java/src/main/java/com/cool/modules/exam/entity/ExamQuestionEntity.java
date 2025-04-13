package com.cool.modules.exam.entity;

import com.cool.core.base.BaseEntity;
import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.handler.Fastjson2TypeHandler;
import com.tangzc.mybatisflex.autotable.annotation.ColumnDefine;
import lombok.Getter;
import lombok.Setter;
import org.dromara.autotable.annotation.Index;

import java.util.List;

@Getter
@Setter
@Table(value = "exam_question", comment = "考试题目表")
public class ExamQuestionEntity extends BaseEntity<ExamQuestionEntity> {

    @ColumnDefine(comment = "题目内容", notNull = true)
    private String content;

    @ColumnDefine(comment = "题目类型", notNull = true)
    private Integer type; // 1-单选题 2-多选题 3-判断题 4-简答题

    @ColumnDefine(comment = "分值", notNull = true)
    private Integer score;

    @ColumnDefine(comment = "难度等级", notNull = true)
    private Integer level; // 1-简单 2-中等 3-困难

    @ColumnDefine(comment = "正确答案", type = "json")
    @Column(typeHandler = Fastjson2TypeHandler.class)
    private List<String> answers;

    @ColumnDefine(comment = "选项", type = "json")
    @Column(typeHandler = Fastjson2TypeHandler.class)
    private List<String> options;

    @ColumnDefine(comment = "解析")
    private String analysis;

    @ColumnDefine(comment = "标签", type = "json")
    @Column(typeHandler = Fastjson2TypeHandler.class)
    private List<String> tags;
} 