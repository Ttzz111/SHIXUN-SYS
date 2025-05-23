package com.cool.modules.exam.controller.admin;

import static com.cool.modules.exam.entity.table.ExamQuestionEntityTableDef.EXAM_QUESTION_ENTITY;

import cn.hutool.json.JSONObject;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import com.cool.core.annotation.CoolRestController;
import com.cool.core.base.BaseController;
import com.cool.core.request.R;
import com.cool.modules.exam.entity.ExamQuestionEntity;
import com.cool.modules.exam.service.ExamQuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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
    
    @PostMapping("/import")
    @Operation(summary = "批量导入题目")
    public R importQuestions(@RequestParam("file") MultipartFile file) {
        try {
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            // 设置别名
            reader.addHeaderAlias("题目内容", "content");
            reader.addHeaderAlias("题目类型(1-单选题,2-多选题,3-判断题,4-简答题)", "type");
            reader.addHeaderAlias("分值", "score");
            reader.addHeaderAlias("难度等级(1-简单,2-中等,3-困难)", "level");
            reader.addHeaderAlias("选项(用|分隔)", "optionsStr");
            reader.addHeaderAlias("正确答案(多个用|分隔)", "answersStr");
            reader.addHeaderAlias("解析", "analysis");
            reader.addHeaderAlias("标签(多个用|分隔)", "tagsStr");
            
            // 读取数据
            List<ExamQuestionEntity> questions = new ArrayList<>();
            List<Map<String,Object>> rows = reader.readAll();
            
            for (int i = 1; i < rows.size(); i++) {
                JSONObject row = new JSONObject(rows.get(i));
                ExamQuestionEntity question = new ExamQuestionEntity();
                question.setContent(row.getStr("content"));
                question.setType(row.getInt("type"));
                question.setScore(row.getInt("score"));
                question.setLevel(row.getInt("level"));
                question.setAnalysis(row.getStr("analysis"));
                
                // 处理选项、答案和标签
                String optionsStr = row.getStr("optionsStr");
                if (optionsStr != null && !optionsStr.isEmpty()) {
                    question.setOptions(Arrays.asList(optionsStr.split("\\|")));
                }
                
                String answersStr = row.getStr("answersStr");
                if (answersStr != null && !answersStr.isEmpty()) {
                    question.setAnswers(Arrays.asList(answersStr.split("\\|")));
                }
                
                String tagsStr = row.getStr("tagsStr");
                if (tagsStr != null && !tagsStr.isEmpty()) {
                    question.setTags(Arrays.asList(tagsStr.split("\\|")));
                }
                
                questions.add(question);
            }
            
            // 批量保存
            service.saveBatch(questions);
            
            return R.ok(questions.size());
        } catch (Exception e) {
            return R.error("导入失败: " + e.getMessage());
        }
    }
    
    @GetMapping("/template")
    @Operation(summary = "下载题目导入模板")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        // 创建ExcelWriter对象
        ExcelWriter writer = ExcelUtil.getWriter();
        
        // 设置表头
        writer.addHeaderAlias("content", "题目内容");
        writer.addHeaderAlias("type", "题目类型(1-单选题,2-多选题,3-判断题,4-简答题)");
        writer.addHeaderAlias("score", "分值");
        writer.addHeaderAlias("level", "难度等级(1-简单,2-中等,3-困难)");
        writer.addHeaderAlias("optionsStr", "选项(用|分隔)");
        writer.addHeaderAlias("answersStr", "正确答案(多个用|分隔)");
        writer.addHeaderAlias("analysis", "解析");
        writer.addHeaderAlias("tagsStr", "标签(多个用|分隔)");
        
        // 创建示例数据
        List<JSONObject> demoData = new ArrayList<>();
        
        // 示例1：单选题
        JSONObject demo1 = new JSONObject();
        demo1.set("content", "在软件工程中，需求分析阶段的主要任务是什么？");
        demo1.set("type", 1);
        demo1.set("score", 5);
        demo1.set("level", 2);
        demo1.set("optionsStr", "编写代码|确定软件需要实现的功能|进行系统测试|部署软件");
        demo1.set("answersStr", "确定软件需要实现的功能");
        demo1.set("analysis", "需求分析是软件工程的第一步，主要任务是明确用户需求，确定软件需要实现的功能。");
        demo1.set("tagsStr", "软件工程|需求分析");
        demoData.add(demo1);
        
        // 示例2：多选题
        JSONObject demo2 = new JSONObject();
        demo2.set("content", "Git版本控制系统中，以下哪些命令用于将本地更改提交到远程仓库？");
        demo2.set("type", 2);
        demo2.set("score", 8);
        demo2.set("level", 2);
        demo2.set("optionsStr", "git pull|git push|git commit|git fetch|git merge");
        demo2.set("answersStr", "git commit|git push");
        demo2.set("analysis", "git commit用于将更改提交到本地仓库，git push用于将本地更改推送到远程仓库。");
        demo2.set("tagsStr", "Git|版本控制");
        demoData.add(demo2);
        
        // 示例3：判断题
        JSONObject demo3 = new JSONObject();
        demo3.set("content", "在软件测试中，单元测试主要关注的是程序的最小可测试单元。");
        demo3.set("type", 3);
        demo3.set("score", 3);
        demo3.set("level", 1);
        demo3.set("optionsStr", "正确|错误");
        demo3.set("answersStr", "正确");
        demo3.set("analysis", "单元测试是对软件中的最小可测试单元进行检查和验证的过程，通常是函数或方法。");
        demo3.set("tagsStr", "软件测试|单元测试");
        demoData.add(demo3);
        
        // 示例4：简答题
        JSONObject demo4 = new JSONObject();
        demo4.set("content", "请简述敏捷开发方法与传统瀑布模型的主要区别。");
        demo4.set("type", 4);
        demo4.set("score", 10);
        demo4.set("level", 3);
        demo4.set("optionsStr", "");
        demo4.set("answersStr", "敏捷开发强调迭代、增量式开发，强调团队协作和快速响应变化，而瀑布模型是一种线性开发方法，按照固定的阶段顺序进行，不易应对需求变更。");
        demo4.set("analysis", "敏捷开发和瀑布模型的主要区别在于开发流程、需求变更处理方式和交付周期等方面。");
        demo4.set("tagsStr", "软件工程|开发方法");
        demoData.add(demo4);
        
        // 写入数据
        writer.write(demoData);
        
        // 保存模板文件到静态资源目录
        String templatePath = System.getProperty("user.dir") + "/cool-admin-java/src/main/resources/static/template";
        java.io.File dir = new java.io.File(templatePath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        try {
            java.io.File file = new java.io.File(templatePath + "/question_template.xlsx");
            java.io.FileOutputStream fos = new java.io.FileOutputStream(file);
            writer.flush(fos);
            fos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // 设置响应头
        response.setContentType("application/vnd.ms-excel;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment;filename=question_template.xlsx");
        
        // 写入响应流
        writer.flush(response.getOutputStream());
        writer.close();
    }
} 