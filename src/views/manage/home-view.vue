<template>
  <el-container>
    <el-header>超市积分系统</el-header>
    <el-main>
      <el-input
        style="margin-bottom: 20px"
        placeholder="请输入内容"
        v-model="search"
        @keyup.enter.native="findConsumer"
        clearable
      >
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <div class="tool" style="margin-bottom: 10px">
        <el-button
          type="primary"
          size="mini"
          @click="exportExcel"
          icon="el-icon-download"
          style="margin-right: 10px"
          >导出</el-button
        >
        <el-button
          ref="uploadBtn"
          type="warning"
          size="mini"
          icon="el-icon-folder-add"
          @click="dangerTip"
          >导入</el-button
        >
        <el-upload
          style="display: inline-block"
          action="action"
          :on-change="readExcel"
          :auto-upload="false"
          :show-file-list="false"
          accept=".xls, .xlsx"
          ref="upload"
          :multiple="true"
        >
          <el-button
            style="display: none"
            ref="uploadBtn"
            type="warning"
            size="mini"
            icon="el-icon-folder-add"
            >导入</el-button
          >
        </el-upload>
      </div>
      <el-table
        id="table"
        :data="
          consumerData.filter(
            (data) =>
              !search ||
              data.name.toLowerCase().includes(search.toLowerCase()) ||
              data.phone.includes(search.toLowerCase())
          )
        "
        height="75vh"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="phone"
          label="手机号"
          width="180"
        ></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="point" label="积分"></el-table-column>
        <el-table-column prop="time" label="更新时间"></el-table-column>
        <el-table-column label="操作" min-width="150px">
          <template slot-scope="scoped">
            <el-button
              type="primary"
              size="mini"
              @click="editConsumer(scoped.row)"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              @click="deletePhone(scoped.row)"
              icon="el-icon-delete"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        title="新增/编辑"
        :visible.sync="dialogFormVisible"
        :close-on-click-modal="false"
      >
        <el-form :model="form" ref="form">
          <el-form-item label="姓名">
            <el-input v-model="form.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input
              v-model="form.phone"
              autocomplete="off"
              :disabled="!isEdit"
            ></el-input>
          </el-form-item>
          <el-form-item label="积分" aria-required="">
            <el-input v-model="form.point" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeForm">取 消</el-button>
          <el-button type="primary" @click="editPointData">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import dbMethod from "../../utils";
import FileSaver from "file-saver";
import * as XLSX from "xlsx";
export default {
  data() {
    return {
      consumerData: [],
      form: {
        name: "",
        phone: "",
        point: "",
      },
      search: "",
      tempPhone: "",
      dialogFormVisible: false,
      isEdit: false,
    };
  },
  mounted() {
    dbMethod
      .initDb()
      .then(() => {
        this.$message({
          type: "success",
          message: "数据库开启成功",
        });
        this.getData();
      })
      .catch(() => {
        this.$message({
          type: "error",
          message: "数据库开启失败,请重试",
        });
      });
  },
  methods: {
    getData() {
      dbMethod.getData().then((res) => {
        this.consumerData = JSON.parse(JSON.stringify(res));
      });
    },
    findConsumer() {
      if (
        typeof Number(this.search) !== "number" ||
        this.search.length > 11 ||
        isNaN(this.search) ||
        !this.search
      ) {
        return;
      }
      dbMethod.getData(this.search).then((res) => {
        this.form.phone = this.search;
        if (res) {
          this.form = JSON.parse(JSON.stringify(res));
          this.isEdit = true;
        } else {
          this.isEdit = false;
        }
      });
      this.dialogFormVisible = true;
    },
    editConsumer(row) {
      this.isEdit = true;
      this.form = JSON.parse(JSON.stringify(row));
      this.tempPhone = this.form.phone;
      this.dialogFormVisible = true;
    },
    deletePhone(row) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          dbMethod.deleteDb(row.phone).then(() => {
            this.getData();
          });
        })
        .catch(() => {});
    },
    editPointData() {
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}-${("0" + date.getDate()).slice(-2)} ${(
        "0" + date.getHours()
      ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${(
        "0" + date.getSeconds()
      ).slice(-2)}`;
      console.log(formattedDate); // 输出类似 '2021-05-14 16:30:00' 的字符串
      this.form.time = formattedDate;
      dbMethod.addData("person", this.form, this.isEdit);
      if (this.tempPhone !== this.form.phone && this.isEdit) {
        this.$confirm("是否删除原有手机号?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            dbMethod
              .deleteDb(this.tempPhone)
              .then(() => {
                this.tempPhone = "";
                this.getData();
              })
              .catch(() => {
                this.tempPhone = "";
                this.getData();
              });
          })
          .catch(() => {});
      }
      this.closeForm();
      this.search = "";
      this.getData();
    },
    exportExcel() {
      this.handleExport("backup", "table");
    },
    handleExport(fileName, id) {
      let xlsxParam = { raw: true };
      let table = document.querySelector("#" + id).cloneNode(true);
      let wb = XLSX.utils.table_to_book(table, xlsxParam);
      let wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: false,
        type: "array",
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          fileName + ".xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") {
          console.log(e, wbout);
        }
      }
      return wbout;
    },
    dangerTip() {
      this.$confirm("此操作将永久覆盖原有数据,是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$refs.uploadBtn.$el.click();
        })
        .catch(() => {});
    },
    readExcel(file) {
      this.consumerData = [];
      dbMethod.clearObjectStore("person").then((res) => {
        console.log(res);
      });
      this.handleReadExcel(file); // 调用读取数据的方法
    },
    handleReadExcel(file) {
      let that = this;
      if (!file) {
        //如果没有文件
        return false;
      } else if (!/.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        this.$message.error("上传格式不正确，请上传xls或者xlsx格式");
        return false;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary",
          });
          if (workbook.SheetNames.length >= 1) {
            this.$message({
              message: "导入数据表格成功",
              showClose: true,
              type: "success",
            });
          }
          const wsname = workbook.SheetNames[0]; //取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); //生成json表格内容
          console.log("生成json：", ws);
          // that.tableData = [];
          for (var i = 0; i < ws.length; i++) {
            let sheetData = {
              // 键名为绑定 el 表格的关键字，值则是 ws[i][对应表头名]
              phone: ws[i]["手机号"],
              name: ws[i]["姓名"],
              time: ws[i]["更新时间"],
              point: ws[i]["积分"],
            };
            console.log("上传的数据:", sheetData);
            //添加到表格中
            that.consumerData.push(sheetData);
            dbMethod.addData("person", sheetData);
            //正常导入需要拿到上传的数据就在这从新弄个数组push进去，然后传给后台，后台保存后查询表格返给前端。
          }
          this.$refs.upload.value = "";
        } catch (e) {
          this.$message({
            type: "error",
            message: "数据异常",
          });
          return false;
        }
      };
      // 如果为原生 input 则应是 files[0]
      fileReader.readAsBinaryString(file.raw);
    },
    closeForm() {
      for (const key in this.form) {
        if (Object.hasOwnProperty.call(this.form, key)) {
          this.form[key] = "";
        }
      }
      this.dialogFormVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-header {
  text-align: center;
  line-height: 60px;
  background-color: #409eff;
  font-size: 20px;
}
</style>
