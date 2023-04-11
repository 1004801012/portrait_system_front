/**
 *
 * @authors liwb (you@example.org)
 * @date    2019/3/4 17:41
 * @version 中原证券 SSO 业务处理
 */
import sha256 from 'sha256';
import { MessageBox } from 'element-ui';
import services from 'services';
import { getLocationHrefParam } from 'cloud-utils';
import { setToken, getToken, setOperatorNo } from '/common/auth';
import { callback, getZYSSOAuthUri } from '/common/func';
import { router } from '/router';
import { getOperatorSelfInfoFunc } from '/common/permission';

// 中原业务 sso 处理
export default function ssoLogin() {
  router.beforeEach((to, from, next) => {
    const REDIRECT_URI = getZYSSOAuthUri();
    const code = getLocationHrefParam('code');
    const actionFlag = getLocationHrefParam('action_flag');
    // console.log(to, from);

    // 登录跳出
    if (actionFlag && actionFlag === 'logout') {
      window.location.href = window.DMP_CONFIG.HOME_PAGE;
      return;
    }

    if (!getToken() && !code) {
      window.location.href = REDIRECT_URI;
      return;
    }

    // 判断是否有token
    if (getToken() && getToken() !== 'undefined') {
      next();
    } else {
      services
        .operatorLogin({
          data: {
            code,
            encode: sha256(window.DMP_CONFIG.CLIENT_ID),
            operator_no: 'operator_no',
            password: 'password',
            verify_code: 'verify_code'
          }
        })
        .then((res) => {
          res &&
            callback(
              res,
              () => {
                const { accessToken, operator_no } = res && res.data;
                setToken(accessToken);
                setOperatorNo(operator_no);
                getOperatorSelfInfoFunc(() => {
                  next();
                });
              },
              () => {
                MessageBox.alert(res.error_info, {
                  callback: (action) => {
                    if (String(res.error_no) === '1014') {
                      window.location.href = window.DMP_CONFIG.HOME_PAGE;
                    }
                  }
                });
              }
            );
        })
        .catch(() => {
          MessageBox.alert('很抱歉，您暂无访问权限~', {
            callback: (action) => {
              window.location.href = window.DMP_CONFIG.HOME_PAGE;
            }
          });
        });
    }
  });
}
