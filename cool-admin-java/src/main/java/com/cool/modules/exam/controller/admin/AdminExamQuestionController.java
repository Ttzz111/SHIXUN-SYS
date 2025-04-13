package com.cool.modules.exam.controller.admin;

import static com.cool.modules.exam.entity.table.ExamQuestionEntityTableDef.EXAM_QUESTION_ENTITY;

import cn.hutool.json.JSONObject;
import com.cool.core.annotation.CoolRestController;
import com.cool.core.base.BaseController;
import com.cool.modules.exam.entity.ExamQuestionEntity;
import com.cool.modules.exam.service.ExamQuestionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 题库管理
 */
@Tag(name = "考试题目", description = "考试题目管理")
@CoolRestController(value = "/admin/exam/question", api = {"add", "delete", "update", "page", "list", "info"})
public class AdminExamQuestionController extends BaseController<ExamQuestionService, ExamQuestionEntity> {

    @Override
    protected void init(HttpServletRequest request, JSONObject requestParams) {
        // 设置分页查询条件
        setPageOption(createOp()
            .fieldEq(EXAM_QUESTION_ENTITY.TYPE, EXAM_QUESTION_ENTITY.LEVEL)
            .keyWordLikeFields(EXAM_QUESTION_ENTITY.CONTENT));
    }
} 