import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "element-ui/lib/theme-chalk/index.css";
import {
  Button,
  Container,
  Header,
  Main,
  Input,
  Select,
  Table,
  TableColumn,
  Message,
  MessageBox,
  Dialog,
  Form,
  FormItem,
  Upload,
} from "element-ui";
Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Input);
Vue.use(Select);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Dialog);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Upload);
Vue.config.productionTip = false;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
