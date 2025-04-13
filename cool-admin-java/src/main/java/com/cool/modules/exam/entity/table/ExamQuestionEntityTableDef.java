package com.cool.modules.exam.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;
import java.util.List;

/**
 * 考试题目表定义
 */
public class ExamQuestionEntityTableDef extends TableDef {

    /**
     * 考试题目
     */
    public static final ExamQuestionEntityTableDef EXAM_QUESTION_ENTITY = new ExamQuestionEntityTableDef();

    /**
     * 主键
     */
    public final QueryColumn ID = new QueryColumn(this, "id");

    /**
     * 创建时间
     */
    public final QueryColumn CREATE_TIME = new QueryColumn(this, "create_time");

    /**
     * 更新时间
     */
    public final QueryColumn UPDATE_TIME = new QueryColumn(this, "update_time");

    /**
     * 题目内容
     */
    public final QueryColumn CONTENT = new QueryColumn(this, "content");

    /**
     * 题目类型
     */
    public final QueryColumn TYPE = new QueryColumn(this, "type");

    /**
     * 分值
     */
    public final QueryColumn SCORE = new QueryColumn(this, "score");

    /**
     * 难度等级
     */
    public final QueryColumn LEVEL = new QueryColumn(this, "level");

    /**
     * 正确答案
     */
    public final QueryColumn ANSWERS = new QueryColumn(this, "answers");

    /**
     * 选项
     */
    public final QueryColumn OPTIONS = new QueryColumn(this, "options");

    /**
     * 解析
     */
    public final QueryColumn ANALYSIS = new QueryColumn(this, "analysis");

    /**
     * 标签
     */
    public final QueryColumn TAGS = new QueryColumn(this, "tags");
    
    /**
     * 所有字段
     */
    public final QueryColumn[] ALL_COLUMNS = new QueryColumn[] { 
        ID, CREATE_TIME, UPDATE_TIME, CONTENT, TYPE, SCORE, LEVEL, ANSWERS, OPTIONS, ANALYSIS, TAGS
    };
    
    /**
     * 默认字段
     */
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[] { 
        ID, CREATE_TIME, UPDATE_TIME, CONTENT, TYPE, SCORE, LEVEL, ANSWERS, OPTIONS, ANALYSIS, TAGS
    };
    
    public ExamQuestionEntityTableDef() {
        super("exam_question", "");
    }
    
} 