/**
 *
 * @authors liwb (you@example.org)
 * @date    2020/8/28 14:22
 * @version $ IIFE
 */

/* name module */
import { router } from '@/router';
import { getOperatorSelfInfoFunc } from '@/common/permission';
import { setOperatorNo } from '@/common/auth';
import Cookies from 'js-cookie';

// 中银业务统一登录处理
export default function unifiedLogin() {
  const operatorNo = Cookies.get('operator_code');
  setOperatorNo(operatorNo);

  router.beforeEach((to, from, next) => {
    getOperatorSelfInfoFunc(() => {
      next();
    });
  });
}
