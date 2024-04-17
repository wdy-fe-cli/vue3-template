// ? Element 常用表单校验规则

/**
 *  @rule 手机号
 */
export function checkPhoneNumber(rule, value, callback) {
  const regexp = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[3-8]{1})|(18[0-9]{1})|(19[0-9]{1})|(14[5-7]{1}))+\d{8})$/
  if (value === '') callback('请输入手机号码')
  if (!regexp.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    return callback()
  }
}

// 存储新密码
let newPassword = ''
// 存储确认密码
let confirmPassword = ''

export const checkPassword = (rule, value, callback) => {
  const regexp = /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{8,}$/
  if (value === '') callback('请输入密码')
  if (!regexp.test(value)) {
    callback(new Error('含大小写英文加数字，至少8个字符'))
  } else {
    // 通过密码格式正则校验
    if (rule.fullField === 'newPassword') {
      newPassword = value
      return callback()
    }

    if (rule.fullField === 'confirmPassword') {
      confirmPassword = value
      return checkNewPassword(newPassword, confirmPassword, callback)
    }

    // 原密码
    return callback()
  }
}

// 新旧密码不一致
export const checkNewPassword = (newValue, confirmValue, callback) => {
  if (newValue !== confirmValue) {
    return callback(new Error('两次密码不一致'))
  }
  return callback()
}
